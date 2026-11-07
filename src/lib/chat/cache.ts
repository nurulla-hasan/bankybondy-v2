import type { InfiniteData } from "@tanstack/react-query";

import type {
  ApiResponse,
  ConversationSnapshot,
  MessageNotification,
  RawChatPerson,
  RawConversationList,
  RawConversationListItem,
  WireChatMessage,
  WireMessageList,
} from "@/types";

import { senderIdOf, toRowPatch } from "./normalize";

/**
 * The thread cache holds the wire shape, not the UI shape: `select` in
 * `chat.hook.ts` normalizes on read, so a socket message and a history page can
 * be stored side by side and only become one type at the edge.
 *
 * `pageParam` is the numeric page. Pages are newest-first and page 1 is the
 * newest, which is why live messages are prepended to `pages[0].result`.
 */
export type ThreadPages = InfiniteData<ApiResponse<WireMessageList>, number>;

/**
 * `select` in `useChatList` unwraps the envelope for the COMPONENT only; the
 * query cache keeps the raw `ApiResponse`. Every cache helper below therefore
 * takes this envelope, not `RawConversationList` — mixing the two is what made
 * `data.data.findIndex` blow up on the first socket `conversation` event.
 */
export type ChatListCache = ApiResponse<RawConversationList>;

/** Does the thread already contain this stored message? */
export function hasMessage(data: ThreadPages | undefined, messageId: string): boolean {
  return Boolean(
    data?.pages.some((page) =>
      page.data.result.some((message) => message._id === messageId),
    ),
  );
}

/** Client-side optimistic bubble, before the server has stored it. */
export interface OptimisticMessageInput {
  clientId: string;
  conversationId: string;
  me: Pick<RawChatPerson, "_id" | "name" | "profile_image">;
  text: string;
  imageUrl: string[];
  videoUrl: string[];
  pdfUrl: string[];
}

export function toOptimisticMessage(input: OptimisticMessageInput): WireChatMessage {
  return {
    _id: `optimistic-${input.clientId}`,
    clientId: input.clientId,
    pending: true,
    text: input.text,
    imageUrl: input.imageUrl,
    videoUrl: input.videoUrl,
    pdfUrl: input.pdfUrl,
    msgByUserId: input.me._id,
    conversationId: input.conversationId,
    createdAt: new Date().toISOString(),
    isDeleted: false,
    userDetails: {
      name: input.me.name,
      profile_image: input.me.profile_image,
    },
    isMyMessage: true,
    seen: false,
  };
}

/**
 * Prepend a local bubble to page 1. It reads exactly like a server message on
 * screen; `pending` is what the bubble uses to show "sending".
 */
export function insertOptimisticMessage(
  data: ThreadPages | undefined,
  message: WireChatMessage,
): ThreadPages | undefined {
  if (!data?.pages.length) return data;

  const [first, ...rest] = data.pages;
  const page = first.data;

  return {
    ...data,
    pages: [
      {
        ...first,
        data: {
          ...page,
          meta: { ...page.meta, total: page.meta.total + 1 },
          result: [message, ...page.result],
        },
      },
      ...rest,
    ],
  };
}

/** Drop a pending bubble (a failed send, or its stored twin just arrived). */
export function removeOptimisticMessage(
  data: ThreadPages | undefined,
  clientId: string,
): ThreadPages | undefined {
  if (!data?.pages.length) return data;

  let removed = 0;
  const pages = data.pages.map((page) => {
    const result = page.data.result.filter((message) => {
      const drop = message.pending && message.clientId === clientId;
      if (drop) removed += 1;
      return !drop;
    });

    return result.length === page.data.result.length
      ? page
      : { ...page, data: { ...page.data, result } };
  });

  if (!removed) return data;

  return {
    ...data,
    pages: pages.map((page, index) =>
      index === 0
        ? {
            ...page,
            data: {
              ...page.data,
              meta: {
                ...page.data.meta,
                total: Math.max(0, page.data.meta.total - removed),
              },
            },
          }
        : page,
    ),
  };
}

/** Is this exact optimistic bubble still waiting for its stored twin? */
export function hasOptimisticMessage(
  data: ThreadPages | undefined,
  clientId: string,
): boolean {
  return Boolean(
    data?.pages.some((page) =>
      page.data.result.some(
        (message) => message.pending && message.clientId === clientId,
      ),
    ),
  );
}

/**
 * The server does not echo `clientId` on a stored message (see
 * `WireChatMessage`), so a socket echo is matched against pending bubbles by
 * content. Sender, text and the three attachment lists must all agree.
 */
function sameUrls(a?: string[] | null, b?: string[] | null): boolean {
  const left = [...(a ?? [])].sort();
  const right = [...(b ?? [])].sort();

  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isSameContent(pending: WireChatMessage, message: WireChatMessage): boolean {
  return (
    (pending.text ?? "").trim() === (message.text ?? "").trim() &&
    sameUrls(pending.imageUrl, message.imageUrl) &&
    sameUrls(pending.videoUrl, message.videoUrl) &&
    sameUrls(pending.pdfUrl, message.pdfUrl)
  );
}

/**
 * Which pending bubble does this echo confirm? `clientId` first (future
 * backends), then sender + content. `null` means the echo is not ours.
 */
export function findPendingTwinClientId(
  data: ThreadPages | undefined,
  message: WireChatMessage,
  meId: string,
): string | null {
  if (!data?.pages.length) return null;
  if (senderIdOf(message) !== meId) return null;

  const candidates = data.pages.flatMap((page) => page.data.result);

  const byClientId = message.clientId
    ? candidates.find(
        (candidate) =>
          candidate.pending && candidate.clientId === message.clientId,
      )
    : undefined;

  const twin =
    byClientId ??
    candidates.find(
      (candidate) =>
        candidate.pending &&
        candidate.clientId &&
        isSameContent(candidate, message),
    );

  return twin?.clientId ?? null;
}

/**
 * Remove the optimistic twin of an incoming message. `meId` is required because
 * only MY pending bubble can be the echo of a message I sent; the receiver has
 * nothing to reconcile.
 */
function removePendingEcho(
  data: ThreadPages,
  message: WireChatMessage,
  meId: string,
): ThreadPages {
  const clientId = findPendingTwinClientId(data, message, meId);
  return clientId ? (removeOptimisticMessage(data, clientId) ?? data) : data;
}

/**
 * Insert the server's stored message into the newest page. Dedupe by `_id` is
 * what makes the two echoes harmless: the sender gets the message over the
 * socket AND in the REST response, and the receiver can see the same event
 * twice after a reconnect.
 *
 * When `meId` is provided, the optimistic bubble this echo belongs to is
 * removed first — the stored message replaces it in place of a duplicate.
 */
export function insertMessageIntoThread(
  data: ThreadPages | undefined,
  message: WireChatMessage,
  meId?: string,
): ThreadPages | undefined {
  if (!data?.pages.length) return data;

  const withReconciled = meId ? removePendingEcho(data, message, meId) : data;
  if (hasMessage(withReconciled, message._id)) return withReconciled;

  const [first, ...rest] = withReconciled.pages;
  const page = first.data;

  return {
    ...withReconciled,
    pages: [
      {
        ...first,
        data: {
          ...page,
          meta: { ...page.meta, total: page.meta.total + 1 },
          result: [message, ...page.result],
        },
      },
      ...rest,
    ],
  };
}

/**
 * Merge a socket `conversation` snapshot into one chat-list cache. The snapshot
 * is not a row (no `members`, no bond status, camelCase peer image), so this is
 * a patch — see `toRowPatch`. A row that is not in the cache is left alone; the
 * caller invalidates the list so the missing row can arrive with real data.
 */
export function patchConversationRow(
  cache: ChatListCache | undefined,
  snapshot: ConversationSnapshot,
): ChatListCache | undefined {
  if (!cache) return cache;

  const list = cache.data;
  const index = list.data.findIndex((row) => row._id === snapshot._id);
  if (index === -1) return cache;

  const existing = list.data[index];
  const patched: RawConversationListItem = {
    ...existing,
    ...toRowPatch(snapshot, existing),
  };

  // A `conversation` event also fires when the other side reads the thread
  // (`markSeen` emits one). Only a new last message is real activity, and only
  // that should move the row to the top — the backend sorts by `updated_at`.
  const lastMessageChanged =
    (snapshot.lastMessage?._id ?? null) !== (existing.lastMessage?._id ?? null);

  if (!lastMessageChanged) {
    const rows = [...list.data];
    rows[index] = patched;
    return { ...cache, data: { ...list, data: rows } };
  }

  const rows = list.data.filter((_, rowIndex) => rowIndex !== index);
  rows.unshift(patched);

  return { ...cache, data: { ...list, data: rows } };
}

export function removeConversationRow(
  cache: ChatListCache | undefined,
  conversationId: string,
): ChatListCache | undefined {
  if (!cache) return cache;

  const list = cache.data;
  const rows = list.data.filter((row) => row._id !== conversationId);
  if (rows.length === list.data.length) return cache;

  return {
    ...cache,
    data: {
      ...list,
      meta: { ...list.meta, total: Math.max(0, list.meta.total - 1) },
      data: rows,
    },
  };
}

/**
 * Put a row back at the top of a list cache — the reverse of
 * `removeConversationRow`, used when an unhidden chat returns. Rows already
 * present are left untouched, so a double restore cannot duplicate one.
 */
export function upsertConversationRow(
  cache: ChatListCache | undefined,
  row: RawConversationListItem,
): ChatListCache | undefined {
  if (!cache) return cache;

  const list = cache.data;
  if (list.data.some((entry) => entry._id === row._id)) return cache;

  return {
    ...cache,
    data: {
      ...list,
      meta: { ...list.meta, total: list.meta.total + 1 },
      data: [row, ...list.data],
    },
  };
}

/** Flip one stored message to its deleted state, keeping its position. */
export function markMessageDeleted(
  data: ThreadPages | undefined,
  messageId: string,
): ThreadPages | undefined {
  if (!data?.pages.length) return data;

  let changed = false;
  const pages = data.pages.map((page) => {
    let pageChanged = false;
    const result = page.data.result.map((message) => {
      if (message._id !== messageId || message.isDeleted) return message;
      pageChanged = true;
      return { ...message, text: null, isDeleted: true };
    });

    if (!pageChanged) return page;
    changed = true;
    return { ...page, data: { ...page.data, result } };
  });

  return changed ? { ...data, pages } : data;
}

/** Zero one row's pill after the thread was opened / marked seen. */
export function clearConversationUnread(
  cache: ChatListCache | undefined,
  conversationId: string,
): ChatListCache | undefined {
  if (!cache) return cache;

  const list = cache.data;
  let changed = false;
  const rows = list.data.map((row) => {
    if (row._id !== conversationId || row.unseenMsg === 0) return row;
    changed = true;
    return { ...row, unseenMsg: 0 };
  });

  return changed ? { ...cache, data: { ...list, data: rows } } : cache;
}

/**
 * `message-notification` is the server's authoritative unread state: it sends
 * every conversation that has unread messages, so anything absent is read.
 */
export function applyUnreadNotification(
  cache: ChatListCache | undefined,
  notification: MessageNotification,
): ChatListCache | undefined {
  if (!cache) return cache;

  const list = cache.data;
  const counts = new Map(
    notification.perConversation.map((entry) => [
      entry.conversationId,
      entry.unreadCount,
    ]),
  );

  let changed = false;
  const rows = list.data.map((row) => {
    const unseenMsg = counts.get(row._id) ?? 0;
    if (row.unseenMsg === unseenMsg) return row;
    changed = true;
    return { ...row, unseenMsg };
  });

  return changed ? { ...cache, data: { ...list, data: rows } } : cache;
}
