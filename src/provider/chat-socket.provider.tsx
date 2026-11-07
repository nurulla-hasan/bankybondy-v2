"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { Socket } from "socket.io-client";

import { useAuth } from "@/hooks/useAuth";
import {
  applyUnreadNotification,
  patchConversationRow,
  removeOptimisticMessage,
  type ChatListCache,
  type ThreadPages,
} from "@/lib/chat/cache";
import { chatKeys } from "@/lib/chat/keys";
import { createChatSocket, setChatSocket } from "@/lib/socket";
import { playReceiveSound } from "@/lib/sound";
import { errorToast } from "@/lib/toast";
import { getSocketToken, refreshSession } from "@/services/api/auth.api";
import type {
  ApiResponse,
  AttachmentRejected,
  ConversationSnapshot,
  MessageNotification,
  SocketError,
  UnreadResult,
} from "@/types";

export type ChatSocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface ChatSocketContextValue {
  socket: Socket | null;
  status: ChatSocketStatus;
}

const ChatSocketContext = createContext<ChatSocketContextValue>({
  socket: null,
  status: "idle",
});

export function useChatSocket(): ChatSocketContextValue {
  return useContext(ChatSocketContext);
}

/** Re-mint before the 30-minute socket token can expire mid-connection. */
const TOKEN_REFRESH_INTERVAL_MS = 20 * 60 * 1000;
/** Never use a token that could expire while the handshake is in flight. */
const TOKEN_SAFETY_MS = 2 * 60 * 1000;

/**
 * Owns the single browser socket: mints its scoped token, refreshes it, and
 * translates the global server events into cache writes and toasts.
 *
 * The per-conversation `message-<target>` subscription is NOT here — it belongs
 * to the open thread (`chat-channel.hook.ts`) so closed conversations do not
 * accumulate listeners.
 */
export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const t = useTranslations("Messages");
  // A locale change must not tear the socket down just to swap a toast string.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const { isAuthenticated } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ChatSocketStatus>("idle");
  const tokenRef = useRef<{ token: string; expiresAt: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // The previous effect's cleanup already disconnected and reset the state;
      // logging out must not start a connection attempt.
      tokenRef.current = null;
      return;
    }

    let disposed = false;

    /** Drop the pending bubble a rejection names, in whichever thread holds it. */
    const removeOptimisticById = (clientId: unknown) => {
      if (typeof clientId !== "string" || !clientId) return;

      queryClient.setQueriesData<ThreadPages>(
        { queryKey: chatKeys.messages() },
        (data) => removeOptimisticMessage(data, clientId),
      );
    };

    const mint = async (): Promise<string | null> => {
      try {
        const response = await getSocketToken();
        tokenRef.current = {
          token: response.data.token,
          expiresAt: Date.now() + response.data.expiresIn * 1000,
        };
        return response.data.token;
      } catch {
        // The access cookie can expire between page loads. Refresh is cookie-based
        // too, so this recovers without the browser ever seeing a token.
        try {
          await refreshSession();
          const retry = await getSocketToken();
          tokenRef.current = {
            token: retry.data.token,
            expiresAt: Date.now() + retry.data.expiresIn * 1000,
          };
          return retry.data.token;
        } catch {
          return null;
        }
      }
    };

    const getToken = async (): Promise<string | null> => {
      const cached = tokenRef.current;
      if (cached && cached.expiresAt - TOKEN_SAFETY_MS > Date.now()) {
        return cached.token;
      }

      return mint();
    };

    const nextSocket = createChatSocket(getToken);
    setChatSocket(nextSocket);

    nextSocket.on("connect", () => {
      if (!disposed) setStatus("connected");
    });

    nextSocket.on("disconnect", () => {
      if (!disposed) setStatus("disconnected");
    });

    nextSocket.on("connect_error", () => {
      if (disposed) return;
      setStatus("error");
      // Force a fresh mint on the next automatic attempt rather than replaying a
      // token the server just refused.
      tokenRef.current = null;
    });

    nextSocket.on("conversation", (snapshot: ConversationSnapshot) => {
      const entries = queryClient.getQueriesData<ChatListCache>({
        queryKey: chatKeys.lists(),
      });

      for (const [key, data] of entries) {
        if (!data) continue;

        const next = patchConversationRow(data, snapshot);
        if (next === data) {
          // The snapshot is for a row this search term does not have (new chat,
          // or filtered out). Only a real list fetch can supply `members` and the
          // bond status, so ask for one.
          void queryClient.invalidateQueries({ queryKey: key });
        } else {
          queryClient.setQueryData(key, next);
        }
      }
    });

    nextSocket.on("message-notification", (notification: MessageNotification) => {
      // The badge query caches the raw envelope (`select` unwraps `.data`), so
      // the notification has to replace the envelope's payload, not the cache
      // root. With no cached envelope yet, a fetch is the only correct move.
      const previous = queryClient.getQueryData<ApiResponse<UnreadResult>>(
        chatKeys.unread(),
      );

      if (shouldPlayIncoming(notification, previous)) playReceiveSound();

      if (previous) {
        queryClient.setQueryData<ApiResponse<UnreadResult>>(chatKeys.unread(), {
          ...previous,
          data: notification,
        });
      } else {
        void queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
      }

      queryClient.setQueriesData<ChatListCache>(
        { queryKey: chatKeys.lists() },
        (data) => applyUnreadNotification(data, notification),
      );
    });

    nextSocket.on("socket-error", (payload: SocketError) => {
      // A rejected send leaves its optimistic bubble without a stored twin, and
      // the rejection carries the `clientId` that was emitted (`messageRejection.ts`).
      removeOptimisticById(detailsClientId(payload?.details));
      errorToast(payload?.message || tRef.current("sendFailed"));
    });

    nextSocket.on("attachment-rejected", (payload: AttachmentRejected) => {
      // The message WAS stored, but with fewer attachments — so its echo will not
      // match the optimistic bubble by content. Remove it by the echoed clientId
      // and let the stored message (arriving next) take its place.
      removeOptimisticById(payload?.clientId);

      const dropped = payload.dropped.imageUrl + payload.dropped.videoUrl + payload.dropped.pdfUrl;
      errorToast(tRef.current("attachmentRejected", { count: dropped }));
    });

    void mint().then((token) => {
      if (disposed) return;

      // Exposing the socket and connecting from this async callback (not from
      // the effect body) keeps the first render free of a cascading update.
      setSocket(nextSocket);

      if (token) {
        setStatus("connecting");
        nextSocket.connect();
      } else {
        setStatus("error");
      }
    });

    const refresh = setInterval(() => {
      void mint();
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      disposed = true;
      clearInterval(refresh);
      nextSocket.removeAllListeners();
      nextSocket.disconnect();
      setChatSocket(null);
      setSocket(null);
      setStatus("idle");
    };
  }, [isAuthenticated, queryClient]);

  const value = useMemo(() => ({ socket, status }), [socket, status]);

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
}

/**
 * `socket-error` puts the send failure in `details`; `messageRejection.ts` nests
 * the caller's `clientId` there so the exact optimistic bubble can be dropped.
 */
function detailsClientId(details: unknown): unknown {
  if (!details || typeof details !== "object") return null;

  return "clientId" in details
    ? (details as { clientId?: unknown }).clientId
    : null;
}

/**
 * Play only when a conversation's unread count actually GREW. `mark-seen` and
 * our own sends also emit `message-notification` with lower/equal counts, and a
 * second message in an already-unread chat keeps `totalUnread` flat — so the
 * comparison has to be per conversation, not on the total.
 *
 * A message that lands in the thread the user is already looking at (visible
 * tab, `/messages?c=<id>`) stays silent: they can see it arrive.
 */
function shouldPlayIncoming(
  notification: MessageNotification,
  previous: ApiResponse<UnreadResult> | undefined,
): boolean {
  const previousCounts = new Map(
    (previous?.data.perConversation ?? []).map((entry) => [
      entry.conversationId,
      entry.unreadCount,
    ]),
  );

  const grown = notification.perConversation.filter(
    (entry) => entry.unreadCount > (previousCounts.get(entry.conversationId) ?? 0),
  );
  if (!grown.length) return false;

  if (typeof document === "undefined" || document.visibilityState !== "visible") {
    return true;
  }

  if (window.location.pathname !== "/messages") return true;

  const openConversationId = new URLSearchParams(window.location.search).get("c");
  if (!openConversationId) return true;

  return !grown.every(
    (entry) => entry.conversationId === openConversationId,
  );
}

