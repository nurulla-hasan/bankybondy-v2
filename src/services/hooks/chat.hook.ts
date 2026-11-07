"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  clearConversationUnread,
  hasOptimisticMessage,
  insertMessageIntoThread,
  insertOptimisticMessage,
  markMessageDeleted,
  removeConversationRow,
  removeOptimisticMessage,
  toOptimisticMessage,
  upsertConversationRow,
  type ChatListCache,
  type ThreadPages,
} from "@/lib/chat/cache";
import { chatKeys } from "@/lib/chat/keys";
import { toChatMessage } from "@/lib/chat/normalize";
import { conversationTarget } from "@/lib/chat/target";
import { getErrorMessage } from "@/lib/error";
import { emitSocketSeen, sendSocketMessage } from "@/lib/socket";
import { playSendSound } from "@/lib/sound";
import { errorToast } from "@/lib/toast";
import type {
  ApiResponse,
  ConversationMediaPage,
  NewMessagePayload,
  RawChatMessage,
  RawChatPerson,
  RawConversationList,
  RawConversationListItem,
  UnreadResult,
} from "@/types";

import {
  deleteMessage,
  getChatGroup,
  getChatList,
  getConversationMedia,
  getMessages,
  getUnreadCount,
  markSeen,
  sendMessage,
} from "../api/chat.api";
import {
  getHiddenChatList,
  hideConversation,
  unhideConversation,
} from "../api/conversation.api";

/** One page is enough to fill the pane on a large screen without a long wait. */
const CHAT_PAGE_SIZE = 30;

/** The list is capped at 500 by the backend; one page gets everything visible. */
const CHAT_LIST_LIMIT = 500;

/** Gallery tile grid: the backend caps `limit` at 100, this keeps each page short. */
const MEDIA_PAGE_SIZE = 40;

/** How long a socket send may stay "sending" before we assume its echo is lost. */
const SOCKET_ECHO_TIMEOUT_MS = 15 * 1000;

export interface ChatThreadData {
  /** Oldest first — exactly what the thread renders. */
  messages: RawChatMessage[];
  total: number;
}

/**
 * The chat list. Search is debounced by `SearchInput` before it reaches the URL,
 * so the key only needs the finished term.
 */
export function useChatList(searchTerm: string) {
  const term = searchTerm.trim();

  return useQuery({
    queryKey: chatKeys.list(term),
    queryFn: () =>
      getChatList({
        limit: CHAT_LIST_LIMIT,
        searchTerm: term || undefined,
      }),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

/**
 * Infinite history for one thread. The endpoint is newest-first, so page 1 holds
 * the newest messages and `fetchNextPage` walks backwards. `select` both reverses
 * and normalizes: a page and a live socket message arrive in two different
 * shapes, and the thread must never see that difference.
 */
export function useChatMessages(conversationId: string | null, meId: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.thread(conversationId),
    queryFn: ({ pageParam }) =>
      getMessages({
        conversationId: conversationId ?? undefined,
        page: pageParam,
        limit: CHAT_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(conversationId && meId),
    staleTime: 15 * 1000,
    select: (data): ChatThreadData => {
      // Live messages shift the server's page offsets, so an older page can
      // overlap page 1. `_id` is the only stable identity; drop repeats before
      // React sees them as duplicate keys.
      const seen = new Set<string>();
      const messages = data.pages
        .flatMap((page) => page.data.result)
        .filter((message) => {
          if (seen.has(message._id)) return false;
          seen.add(message._id);
          return true;
        })
        .map((message) => toChatMessage(message, meId))
        .reverse();

      return { messages, total: data.pages[0]?.data.meta.total ?? 0 };
    },
  });
}

export interface SendMessageVariables {
  conversation: RawConversationListItem;
  payload: NewMessagePayload;
  /** The signed-in profile, so the optimistic bubble renders like a real one. */
  me: Pick<RawChatPerson, "_id" | "name" | "profile_image">;
  /** Sent to the server and used as the optimistic bubble's local id. */
  clientId: string;
}

/** One id per send, shared by the socket payload and the optimistic bubble. */
export function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * One send hook, two transports:
 * - `one-two-one` goes over REST (`POST /message/send`), which works with the
 *   socket down and returns the stored message for the cache.
 * - `chat-group` and `bond-link-group` only exist on the socket; there is no
 *   REST twin, so an offline send fails loudly instead of vanishing.
 *
 * Both transports resolve the mutation as soon as the send is accepted, so the
 * composer stays optimistic. The bubble appears immediately (`onMutate`) and is
 * replaced by the stored message in the background: the REST reply, or the
 * socket echo matched by content because the backend does not return `clientId`
 * on a stored message. A failed send removes the bubble; only a send that could
 * not start at all (no receiver, socket down) rejects and keeps the draft.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const t = useTranslations("Messages");

  return useMutation({
    mutationFn: async ({ conversation, payload, me, clientId }: SendMessageVariables) => {
      const content = {
        text: payload.text,
        imageUrl: payload.imageUrl,
        videoUrl: payload.videoUrl ?? [],
        pdfUrl: payload.pdfUrl,
        clientId,
      };

      if (conversation.type === "one-two-one") {
        const receiver = conversation.userData?._id;
        if (!receiver) {
          throw new Error("This conversation has no other participant");
        }

        const key = chatKeys.thread(conversation._id);

        // Do not make the composer wait for this reply: the server moderates
        // before it stores the message, so the round-trip can take seconds.
        // Resolve now and reconcile in the background — the socket echo of the
        // stored message usually lands even before the HTTP reply.
        void sendMessage({ ...content, receiver })
          .then((response) => {
            const confirmsPending = hasOptimisticMessage(
              queryClient.getQueryData<ThreadPages>(key),
              clientId,
            );

            queryClient.setQueryData<ThreadPages>(key, (data) =>
              insertMessageIntoThread(
                removeOptimisticMessage(data, clientId),
                response.data,
                me._id,
              ),
            );

            // Last-message preview and ordering come from the server list; this
            // covers the REST-send-with-socket-down path.
            void queryClient.invalidateQueries({ queryKey: chatKeys.lists() });

            // Off the promise chain so a sound failure can never be mistaken
            // for a failed send.
            if (confirmsPending) window.setTimeout(playSendSound, 0);
          })
          .catch((error: unknown) => {
            queryClient.setQueryData<ThreadPages>(key, (data) =>
              removeOptimisticMessage(data, clientId),
            );
            // A lost reply may still mean the message was stored; the refetch
            // reconciles the thread with whichever truth the server has.
            void queryClient.invalidateQueries({ queryKey: key });

            errorToast(
              t("sendFailed"),
              getErrorMessage(error, t("sendFailedDescription")),
            );
          });

        return null;
      }

      const target = conversationTarget(conversation);
      if (!target) {
        throw new Error("This conversation is missing its group id");
      }

      sendSocketMessage(
        conversation.type === "chat-group"
          ? { ...content, groupId: target }
          : { ...content, bondLinkId: target },
      );

      return null;
    },
    onMutate: ({ conversation, payload, me, clientId }) => {
      const key = chatKeys.thread(conversation._id);

      // If the thread is not cached yet there is nothing to prepend to; the
      // fetch that is already in flight will include the stored message.
      if (!queryClient.getQueryData<ThreadPages>(key)) return;

      queryClient.setQueryData<ThreadPages>(key, (data) =>
        insertOptimisticMessage(
          data,
          toOptimisticMessage({
            clientId,
            conversationId: conversation._id,
            me,
            text: payload.text,
            imageUrl: payload.imageUrl,
            videoUrl: payload.videoUrl ?? [],
            pdfUrl: payload.pdfUrl,
          }),
        ),
      );
    },
    onSuccess: (_response, { conversation, clientId }) => {
      // 1-a-1 reconciles in the background (see mutationFn above).
      if (conversation.type === "one-two-one") return;

      // A socket send has no ack: the stored message arrives on
      // `message-<target>` and replaces the pending bubble by content. That echo
      // is the confirmation; if it never comes, drop the bubble and refetch once
      // instead of leaving it pending forever.
      const key = chatKeys.thread(conversation._id);

      window.setTimeout(() => {
        const data = queryClient.getQueryData<ThreadPages>(key);
        if (!hasOptimisticMessage(data, clientId)) return;

        queryClient.setQueryData<ThreadPages>(key, (current) =>
          removeOptimisticMessage(current, clientId),
        );
        void queryClient.invalidateQueries({ queryKey: key });
      }, SOCKET_ECHO_TIMEOUT_MS);
    },
    onError: (error, { conversation, clientId }) => {
      // The send never reached the server: drop the bubble so the thread does
      // not keep a message that does not exist.
      queryClient.setQueryData<ThreadPages>(
        chatKeys.thread(conversation._id),
        (data) => removeOptimisticMessage(data, clientId),
      );

      errorToast(t("sendFailed"), getErrorMessage(error, t("sendFailedDescription")));
    },
  });
}

/**
 * Mark the open thread read. REST is the source of truth (socket could be down),
 * and the socket `seen` event additionally refreshes the badge on every device
 * while the connection is alive.
 */
export function useMarkSeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      emitSocketSeen(conversationId);
      return markSeen(conversationId);
    },
    onMutate: (conversationId) => {
      queryClient.setQueriesData<ChatListCache>(
        { queryKey: chatKeys.lists() },
        (data) => clearConversationUnread(data, conversationId),
      );

      queryClient.setQueryData<ApiResponse<UnreadResult>>(
        chatKeys.unread(),
        (previous) => {
          if (!previous) return previous;

          const current = previous.data;
          const hadUnread = current.perConversation.some(
            (entry) => entry.conversationId === conversationId,
          );
          if (!hadUnread) return previous;

          return {
            ...previous,
            data: {
              totalUnread: Math.max(0, current.totalUnread - 1),
              perConversation: current.perConversation.filter(
                (entry) => entry.conversationId !== conversationId,
              ),
            },
          };
        },
      );
    },
    onSettled: () => {
      // Server truth, in case another device read the same thread meanwhile.
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

/**
 * Hide the row immediately; restore every cached list if the server refuses, so
 * the row cannot silently disappear from one search term only.
 */
export function useHideConversation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Messages");

  return useMutation({
    mutationFn: (conversationId: string) => hideConversation(conversationId),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.lists() });

      const snapshots = queryClient.getQueriesData<ChatListCache>({
        queryKey: chatKeys.lists(),
      });

      queryClient.setQueriesData<ChatListCache>(
        { queryKey: chatKeys.lists() },
        (data) => removeConversationRow(data, conversationId),
      );

      return { snapshots };
    },
    onError: (error, _conversationId, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      errorToast(t("hideFailed"), getErrorMessage(error, t("hideFailedDescription")));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

/**
 * Navbar badge. The socket's `message-notification` overwrites this cache live;
 * the interval is only a fallback for when the socket never connected.
 */
export function useChatUnreadCount(enabled = true) {
  return useQuery({
    queryKey: chatKeys.unread(),
    queryFn: getUnreadCount,
    select: (response) => response.data,
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/** The chats this user hid, newest first — the reverse door to a hidden row. */
export function useHiddenChats() {
  return useQuery({
    queryKey: chatKeys.hidden(),
    queryFn: () => getHiddenChatList({ limit: CHAT_LIST_LIMIT }),
    select: (response) => response.data,
    staleTime: 30 * 1000,
  });
}

/**
 * Restore a hidden chat: drop it from the hidden list and put the row back at
 * the top of every cached chat list. On failure both caches are refetched, so a
 * refused unhide cannot leave the row showing in the main list.
 */
export function useUnhideConversation() {
  const queryClient = useQueryClient();
  const t = useTranslations("Messages");

  return useMutation({
    mutationFn: (conversationId: string) => unhideConversation(conversationId),
    onSuccess: (_result, conversationId) => {
      const hidden = queryClient.getQueryData<ApiResponse<RawConversationList>>(
        chatKeys.hidden(),
      );
      const row = hidden?.data.data.find((entry) => entry._id === conversationId);

      if (row) {
        queryClient.setQueryData<ApiResponse<RawConversationList>>(
          chatKeys.hidden(),
          (previous) => removeConversationRow(previous as ChatListCache, conversationId),
        );
      }

      if (row) {
        queryClient.setQueriesData<ChatListCache>(
          { queryKey: chatKeys.lists() },
          (previous) => upsertConversationRow(previous, row),
        );
      }
    },
    onError: (error) => {
      errorToast(t("unhideFailed"), getErrorMessage(error, t("unhideFailedDescription")));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.hidden() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

/**
 * Every image/video/pdf in one thread, paginated newest-last (the pipeline sorts
 * by message id). The gallery sheet walks pages until `fetchNextPage` ends.
 */
export function useConversationMedia(conversationId: string | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: chatKeys.media(conversationId),
    queryFn: ({ pageParam }) =>
      getConversationMedia(conversationId as string, {
        page: pageParam,
        limit: MEDIA_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(conversationId) && enabled,
    staleTime: 30 * 1000,
    select: (data): ConversationMediaPage => {
      const items = data.pages.flatMap((page) => page.data.items);
      return {
        meta: data.pages[0]?.data.meta ?? { page: 1, limit: 0, total: 0, totalPages: 0 },
        urls: items.map((item) => item.url),
        items,
      };
    },
  });
}

/** The group roster behind the chat-info sheet. Non-group chats never call it. */
export function useChatGroup(groupId: string | null) {
  return useQuery({
    queryKey: chatKeys.group(groupId),
    queryFn: () => getChatGroup(groupId as string),
    select: (response) => response.data,
    enabled: Boolean(groupId),
    staleTime: 60 * 1000,
  });
}

/**
 * Soft-delete one of our own messages. The thread cache is patched in place so
 * the bubble flips immediately; the server's socket event reaches the other
 * participants, and a failed call refetches to whatever truth the server holds.
 */
export function useDeleteMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const t = useTranslations("Messages");
  const key = chatKeys.thread(conversationId);

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<ThreadPages>(key, (data) =>
        markMessageDeleted(data, messageId),
      );
    },
    onError: (error) => {
      errorToast(t("deleteFailed"), getErrorMessage(error, t("deleteFailedDescription")));
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
