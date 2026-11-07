import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ConversationHiddenResult,
  ConversationListQueryParams,
  RawConversationList,
} from "@/types";

/**
 * The chats this user hid — same row shape as the main list, with the `hiddenBy`
 * filter inverted. The main list omits hidden rows, so this is the only way back
 * to them.
 * Endpoint: GET /conversation/get-hidden-chats
 */
export function getHiddenChatList(params?: ConversationListQueryParams) {
  return apiClient<ApiResponse<RawConversationList>>(
    "/conversation/get-hidden-chats",
    { method: "GET", query: params },
  );
}

/**
 * Hide a conversation for the signed-in user only. The server keeps the data
 * and the other participants untouched (`conversation.service.ts`
 * `setConversationHidden`).
 * Endpoint: PATCH /conversation/hide/:id
 */
export function hideConversation(conversationId: string) {
  return apiClient<ApiResponse<ConversationHiddenResult>>(
    `/conversation/hide/${conversationId}`,
    { method: "PATCH" },
  );
}

/**
 * Undo {@link hideConversation}. The optimistic hide is rolled back with this
 * when the user asks for it, not automatically.
 * Endpoint: PATCH /conversation/unhide/:id
 */
export function unhideConversation(conversationId: string) {
  return apiClient<ApiResponse<ConversationHiddenResult>>(
    `/conversation/unhide/${conversationId}`,
    { method: "PATCH" },
  );
}
