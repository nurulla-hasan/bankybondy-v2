import type { PaginationMeta } from "./api.types";
import type { RawBondLinkStatus } from "./bond-api.types";

/**
 * `conversation.enum.ts:1-6`. `project-group` is filtered out of every read
 * (`conversation.service.ts:78`) and the socket refuses it with 403, so it can
 * arrive only as a stale value, never as a rendered row.
 */
export type ConversationType =
  | "chat-group"
  | "one-two-one"
  | "project-group"
  | "bond-link-group";

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
 * One message from `GET /message/get-messages`. There is no message-type enum
 * and no sent/delivered/read status; a message is media-bearing when its URL
 * arrays are non-empty. When `isDeleted`, all four content fields arrive as
 * `null` rather than empty (`message.service.ts:185-199`).
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
}

/** Messages sort newest-first server-side, so the UI has to reverse the page. */
export interface RawMessageList {
  meta: PaginationMeta;
  result: RawChatMessage[];
}

export interface ConversationListQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface MessageListQueryParams {
  page?: number;
  limit?: number;
}

/**
 * What a send carries: `text` is never optional server-side, so an attachment-only
 * message ships it as `""`, and every media kind is an array of uploaded URLs
 * (`message.interface.ts:5-9`).
 */
export interface NewMessagePayload {
  text: string;
  imageUrl: string[];
  pdfUrl: string[];
}
