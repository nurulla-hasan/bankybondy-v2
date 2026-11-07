import { io, type Socket } from "socket.io-client";

import type { SocketSendMessageInput } from "@/types";

/**
 * The socket and the API share a host; the API path is `/api/v1` and the
 * Socket.IO path is the default `/socket.io`. Deriving the origin keeps local
 * development working from one variable, while a deployment that splits them
 * can set `NEXT_PUBLIC_SOCKET_URL`.
 */
export function getSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (explicit) return explicit;

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:5000/api/v1";

  return apiBase.replace(/\/api\/v1\/?$/, "");
}

/**
 * Module-level singleton. The provider owns its lifecycle; hooks only use it to
 * emit. Keeping it here (rather than in React context) means `useSendMessage` can
 * stay a plain mutation and still refuse to pretend a group send succeeded when
 * the socket is down.
 */
let chatSocket: Socket | null = null;

export function setChatSocket(socket: Socket | null): void {
  chatSocket = socket;
}

export function getChatSocket(): Socket | null {
  return chatSocket;
}

export function isChatSocketConnected(): boolean {
  return Boolean(chatSocket?.connected);
}

/**
 * Create the connection with a callback for `auth`: socket.io calls it on EVERY
 * attempt, including automatic reconnects, so a re-minted token is always the
 * one used and a stale one is never replayed.
 */
export function createChatSocket(getToken: () => Promise<string | null>): Socket {
  return io(getSocketUrl(), {
    autoConnect: false,
    // Default transport order (polling, then upgrade to websocket). The auth
    // token travels in the handshake, not in cookies, so credentials stay off.
    auth: (callback) => {
      void getToken().then((token) => callback({ token: token ?? "" }));
    },
  });
}

/**
 * Group and bond-link sends exist only on the socket (`handleChat.ts`); the
 * server echoes the stored message back on `message-<target>`. There is no ack,
 * so "offline" is the only failure this side can detect.
 */
export function sendSocketMessage(input: SocketSendMessageInput): void {
  if (!chatSocket?.connected) {
    throw new Error("Chat socket is not connected");
  }

  chatSocket.emit("send-message", input);
}

/** Mark a thread seen live; the server then refreshes our unread badge. */
export function emitSocketSeen(conversationId: string): void {
  if (!chatSocket?.connected) return;

  chatSocket.emit("seen", { conversationId });
}
