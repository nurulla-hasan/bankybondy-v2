import { apiClient } from "@/lib/api-client";
import type { ApiResponse, ConversationHiddenResult } from "@/types";

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
