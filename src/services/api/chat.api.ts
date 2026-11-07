import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ConversationFileKind,
  ConversationListQueryParams,
  ConversationUploadResult,
  MarkSeenResult,
  MessageListQueryParams,
  RawConversationList,
  SendMessageInput,
  UnreadResult,
  WireChatMessage,
  WireMessageList,
} from "@/types";

/**
 * Multer decides the destination by FIELD NAME, and the backend only declares
 * these three for conversation uploads (`helper/mutler-s3-uploader.ts`).
 */
const UPLOAD_FIELD: Record<ConversationFileKind, string> = {
  image: "conversation_image",
  video: "conversation_video",
  pdf: "conversation_pdf",
};

/**
 * Chat fetchers. The envelope stays nested on purpose — `select` in
 * `services/hooks/chat.hook.ts` is what unwraps it, exactly like the friend and
 * notification modules.
 *
 * Two doors, one message shape: `getMessages` returns history pages, `sendMessage`
 * returns the message that was just stored. Both are `WireChatMessage`, which
 * `lib/chat/normalize.ts` turns into what the thread renders.
 */

/**
 * The chat list. Note the oddities this endpoint keeps: the row key inside
 * `data` is `data` (not `result`), and the controller answers a GET with 201
 * (`conversation.controller.ts:12`).
 * Endpoint: GET /conversation/get-chat-list
 */
export function getChatList(params?: ConversationListQueryParams) {
  return apiClient<ApiResponse<RawConversationList>>(
    "/conversation/get-chat-list",
    { method: "GET", query: params },
  );
}

/**
 * One page of a thread, newest first. A `conversationId` that resolves to
 * nothing answers with an empty page rather than a 404, which is what lets a
 * brand-new chat need no special case (`message.service.ts:60-72`).
 * Endpoint: GET /message/get-messages
 */
export function getMessages(params: MessageListQueryParams) {
  return apiClient<ApiResponse<WireMessageList>>("/message/get-messages", {
    method: "GET",
    query: params,
  });
}

/**
 * Send a 1-a-1 message over HTTP — the twin of the socket's `receiver` branch,
 * same core, same rejections (`message.controller.ts:77-97`). The response is
 * the stored message, and its `_id` is the authority the optimistic bubble is
 * replaced with.
 * Endpoint: POST /message/send
 */
export function sendMessage(input: SendMessageInput) {
  return apiClient<ApiResponse<WireChatMessage>>("/message/send", {
    method: "POST",
    body: input,
  });
}

/**
 * Mark everything in one thread as read. HTTP twin of the socket `seen` event,
 * so a read receipt does not need a live connection.
 * Endpoint: POST /message/mark-seen
 */
export function markSeen(conversationId: string) {
  return apiClient<ApiResponse<MarkSeenResult>>("/message/mark-seen", {
    method: "POST",
    body: { conversationId },
  });
}

/**
 * How many chats have something unread, plus the per-chat counts. The total is
 * a count of CONVERSATIONS, not of messages — that is what keeps the navbar
 * badge and the bolded rows agreeing (`message.service.ts:217-220`).
 * Endpoint: GET /message/unread-count
 */
export function getUnreadCount() {
  return apiClient<ApiResponse<UnreadResult>>("/message/unread-count", {
    method: "GET",
  });
}

/**
 * Upload one staged attachment. The composer calls this as soon as a file is
 * picked, then sends only the CloudFront URLs it gets back — the send paths
 * reject anything that is not on our CDN.
 * Endpoint: POST /file-upload/upload-conversation-files
 */
export function uploadConversationFile(file: File, kind: ConversationFileKind) {
  const body = new FormData();
  body.append(UPLOAD_FIELD[kind], file);

  return apiClient<ApiResponse<ConversationUploadResult>>(
    "/file-upload/upload-conversation-files",
    { method: "POST", body },
  );
}

/**
 * Remove staged files that will never be sent (removed from the composer, or a
 * send that failed and was abandoned). The server only deletes URLs under the
 * caller's own conversation prefixes (`file.controller.ts` `deleteFiles`).
 * Endpoint: POST /file-upload/delete-files
 */
export function deleteConversationFiles(files: string[]) {
  return apiClient<ApiResponse<null>>("/file-upload/delete-files", {
    method: "POST",
    body: { files },
  });
}
