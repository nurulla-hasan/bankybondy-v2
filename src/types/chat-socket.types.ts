import type {
  ConversationType,
  RawChatLastMessage,
  UnreadPerConversation,
} from "./chat-api.types";

/**
 * Payloads the backend emits on the socket (`handleChat.ts`,
 * `helper/attachmentNotice.ts`, `socket/helper.ts`). These are NOT the REST
 * shapes: `conversation` in particular is a different object from a chat-list
 * row, which is why the cache merges a patch instead of replacing the row.
 */

/**
 * `helper/getSingleConversation.ts:56-73`, sent on the `conversation` event.
 * Three differences from a chat-list row matter: the peer image is camelCase
 * `profileImage` (the list uses `profile_image`), there is no `members`, and
 * `bondLink` has no `status` because that populate selects `name` only.
 */
export interface ConversationSnapshot {
  _id: string;
  type: ConversationType;
  userData: { _id: string; name: string; profileImage?: string } | null;
  unseenMsg: number;
  lastMessage: RawChatLastMessage | null;
  chatGroup?: { _id: string; name: string; image?: string } | null;
  bondLink?: { _id: string; name: string } | null;
}

/** `message-notification` (`helper/emitUnreadCount.ts`). */
export interface MessageNotification {
  totalUnread: number;
  perConversation: UnreadPerConversation[];
}

/**
 * `attachment-rejected`, emitted to the SENDER only when some attachment did
 * not survive the CDN filter. `dropped` is a count per kind, not a list of urls.
 */
export interface AttachmentRejected {
  conversationId?: string;
  messageId?: string;
  clientId?: string;
  dropped: { imageUrl: number; videoUrl: number; pdfUrl: number };
  reason: "not_cdn_url" | "cdn_unconfigured";
}

/** `socket-error` (`socket/helper.ts:3-13`). Send rejections land here. */
export interface SocketError {
  code: number;
  message: string;
  type: "validation" | "database" | "auth" | "general";
  details?: unknown;
}
