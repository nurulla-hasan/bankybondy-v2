import type { PaginationMeta } from "./api.types";
import type { RawBondLinkStatus } from "./bond-api.types";

/**
 * `conversation.enum.ts` after the project/institution removal: three values.
 * A stale `project-group` can no longer be produced by any read.
 */
export type ConversationType = "chat-group" | "one-two-one" | "bond-link-group";

/**
 * The person shape the chat module ships: `name profile_image` only. Email was
 * deliberately removed from this projection (`conversation.service.ts:295-299`).
 */
export interface RawChatPerson {
  _id: string;
  name: string;
  profile_image?: string;
}

/**
 * `lastMessage` is populated raw (`conversation.service.ts:81-94`), so unlike a
 * message page it still carries the text of a deleted message. The backend
 * should null it the way `message.service.ts:185-199` does.
 */
export interface RawChatLastMessage {
  _id: string;
  text: string | null;
  imageUrl?: string[] | null;
  videoUrl?: string[] | null;
  pdfUrl?: string[] | null;
  msgByUserId: string;
  createdAt?: string;
  isDeleted?: boolean;
}

/**
 * One chat-list row. The peer of a 1-a-1 chat is `userData`; groups carry
 * `chatGroup` for the name and `members` for the avatars.
 */
export interface RawConversationListItem {
  _id: string;
  type: ConversationType;
  userData: RawChatPerson | null;
  chatGroup?: { _id: string; name: string; image?: string } | null;
  bondLink?: { _id: string; name: string; status: RawBondLinkStatus } | null;
  lastMessage: RawChatLastMessage | null;
  created_at?: string;
  updated_at?: string;
  unseenMsg: number;
  members: RawChatPerson[];
}

/**
 * Meta and rows both live inside `data`, and the row key here is `data` — not
 * `result` like every other list (`conversation.service.ts:352-360`). The
 * controller also answers this GET with status 201
 * (`conversation.controller.ts:12`).
 */
export interface RawConversationList {
  meta: PaginationMeta;
  data: RawConversationListItem[];
}

/**
 * One message as the UI renders it: sender id always a string, sender name
 * always present, `isMyMessage` always decided. Nothing on the wire is exactly
 * this, so `lib/chat/normalize.ts` produces it — see `WireChatMessage`.
 */
export interface RawChatMessage {
  _id: string;
  text: string | null;
  imageUrl: string[] | null;
  videoUrl: string[] | null;
  pdfUrl: string[] | null;
  msgByUserId: string;
  conversationId: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
  /** Projection keeps `name profile_image` only — no id. */
  userDetails: Pick<RawChatPerson, "name" | "profile_image">;
  isMyMessage: boolean;
  /** Was this message read by me. Only the history page answers it; a message
   * that just arrived has no idea who is looking, so normalize assumes read. */
  seen?: boolean;
  /** Client-side only: the id we generated for an optimistic bubble still
   * waiting for the server. The backend never echoes `clientId` back on a
   * stored message — it appears only in a rejection's `details`. */
  clientId?: string;
  /** Client-side only: this bubble is optimistic and has no `_id` from the DB
   * yet. Cleared when the stored message replaces it. */
  pending?: boolean;
}

/**
 * What the network actually sends for a message, on both doors:
 * - `GET /message/get-messages` (`message.pipeline.ts` `$project`): `msgByUserId`
 *   is an id string, `userDetails` and `isMyMessage`/`seen` are present.
 * - a send (`POST /message/send`, socket `message-*`): `msgByUserId` arrives
 *   POPULATED as an object next to the mirrored `userDetails`
 *   (`helper/messageEmitShape.ts`), and `isMyMessage`/`seen` are absent because
 *   one payload goes to both parties and only the reader knows which side it is on.
 */
export interface WireChatMessage {
  _id: string;
  text: string | null;
  imageUrl: string[] | null;
  videoUrl: string[] | null;
  pdfUrl: string[] | null;
  msgByUserId: string | RawChatPerson;
  conversationId: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
  userDetails?: Pick<RawChatPerson, "name" | "profile_image">;
  isMyMessage?: boolean;
  seen?: boolean;
  /** Optimistic bubble that is already in the cache but not on the server. */
  pending?: boolean;
  /** Echo id we sent; the backend only repeats it in rejection details. */
  clientId?: string;
}

/** Messages sort newest-first server-side, so the UI has to reverse the page. */
export interface RawMessageList {
  meta: PaginationMeta;
  result: RawChatMessage[];
}

/** The un-normalized twin, which is what the fetchers return. */
export interface WireMessageList {
  meta: PaginationMeta;
  result: WireChatMessage[];
}

export interface ConversationListQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface MessageListQueryParams {
  conversationId?: string;
  page?: number;
  limit?: number;
}

export type MediaKind = "image" | "video" | "pdf";

/**
 * `GET /conversation/get-media-files/:id` — one attachment, newest-first order is
 * NOT guaranteed: the pipeline sorts by message `_id` ascending. `urls` is the
 * flat twin of `items`, derived server-side so the two cannot disagree
 * (`media.pipeline.ts`).
 */
export interface ConversationMediaItem {
  url: string;
  kind: MediaKind;
  messageId: string;
  createdAt?: string;
}

export interface ConversationMediaPage {
  meta: PaginationMeta;
  urls: string[];
  items: ConversationMediaItem[];
}

export interface MediaGalleryQueryParams {
  page?: number;
  limit?: number;
}

/**
 * `GET /chatGroup/get/:id` (`chatGroup.service.ts:288-322`). Members are the
 * `name profile_image _id` projection, the creator is listed separately.
 */
export interface ChatGroupDetails {
  _id: string;
  name: string;
  image?: string;
  creator: RawChatPerson | null;
  participants: RawChatPerson[];
}

/**
 * What a send carries: `text` is never optional server-side, so an attachment-only
 * message ships it as `""`, and every media kind is an array of uploaded URLs
 * (`message.interface.ts:5-9`).
 */
export interface NewMessagePayload {
  text: string;
  imageUrl: string[];
  videoUrl?: string[];
  pdfUrl: string[];
}

/** Body of `POST /message/send`: the content, who it goes to, our own echo id. */
export interface SendMessageInput extends NewMessagePayload {
  receiver: string;
  clientId?: string;
}

/** `GET /message/unread-count` (`message.service.ts:196-228`). */
export interface UnreadPerConversation {
  conversationId: string;
  unreadCount: number;
}

/**
 * `totalUnread` counts CONVERSATIONS that have something unread, not messages —
 * that is what makes the navbar badge agree with the bolded rows.
 * (`message.service.ts:217-220`)
 */
export interface UnreadResult {
  totalUnread: number;
  perConversation: UnreadPerConversation[];
}

/** `POST /message/mark-seen` answers with this and nothing else. */
export interface MarkSeenResult {
  marked: true;
}

/**
 * `GET /auth/socket-token` (`helper/socketToken.ts`). The token is scoped to the
 * Socket.IO handshake and is rejected by the HTTP middleware, so it can live in
 * memory and be re-minted freely.
 */
export interface SocketTokenResult {
  token: string;
  expiresIn: number;
}

/** `POST /auth/refresh-token` — the browser sends the HttpOnly refresh cookie. */
export interface RefreshSessionResult {
  accessToken: string;
}

/** Which multer field a picked file goes into. */
export type ConversationFileKind = "image" | "video" | "pdf";

/**
 * `POST /file-upload/upload-conversation-files` (`file.controller.ts`). Every
 * URL is a CloudFront URL — the socket/REST send filters anything else out.
 */
export interface ConversationUploadResult {
  images: string[];
  videos: string[];
  pdfs: string[];
}

/**
 * `PATCH /conversation/hide/:id` and `PATCH /conversation/unhide/:id`.
 * `setConversationHidden` selects `_id hiddenBy` only.
 */
export interface ConversationHiddenResult {
  _id: string;
  hiddenBy: string[];
}

/**
 * `socket.emit("send-message", ...)`. Groups and bond links have no REST send
 * (`handleChat.ts`), so this is their only door. The three target fields are
 * mutually exclusive on the server.
 */
export interface SocketSendMessageInput {
  text: string;
  imageUrl?: string[];
  videoUrl?: string[];
  pdfUrl?: string[];
  receiver?: string;
  groupId?: string;
  bondLinkId?: string;
  clientId?: string;
}
