import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  RawAudioTopicList,
  TopicListQueryParams,
} from "@/types";

/**
 * The topic catalog, each with its published-audio count. The endpoint caps
 * `limit` at 500 (`clampLimit`).
 * Endpoint: GET /topic/all-topics
 */
export function getAudioTopics(params?: TopicListQueryParams) {
  return apiClient<ApiResponse<RawAudioTopicList>>("/topic/all-topics", {
    method: "GET",
    query: params,
  });
}
