import { apiClient } from "@/lib/api-client";
import type { ApiResponse, GlobalSearchResult } from "@/types";

/**
 * Global search (people, bonds, audios)
 * Endpoint: GET /search/global?q=<term>
 */
export function globalSearch(q: string) {
  return apiClient<ApiResponse<GlobalSearchResult>>("/search/global", {
    method: "GET",
    query: { q },
  });
}
