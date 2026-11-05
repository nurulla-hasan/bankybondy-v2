import { apiClient } from "@/lib/api-client";
import type { AddRatingInput, ApiResponse } from "@/types";

/**
 * Create or edit the caller's rating for one counterpart on a bond link
 * (idempotent upsert per ratedBy/rated/bondLink pair, service:78-113).
 * Endpoint: POST /bond-rating/add-rating (bondRating.routes.ts:10-15)
 */
export function addBondRating(input: AddRatingInput) {
  return apiClient<ApiResponse<unknown>>("/bond-rating/add-rating", {
    method: "POST",
    body: { ...input, comment: input.comment?.trim() || undefined },
  });
}
