import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/build-query-string";
import type {
  ApiResponse,
  BondLinkQueryParams,
  CreateBondLinkInput,
  RawBondLink,
  RawBondLinkList,
} from "@/types";

/**
 * List the authenticated user's bond links.
 * Endpoint: GET /bond-link/my-bond-links
 */
export function getMyBondLinks(params: BondLinkQueryParams = {}) {
  const query = buildQueryString({
    searchTerm: params.searchTerm,
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    status: params.status,
  });

  return apiClient<ApiResponse<RawBondLinkList>>(
    `/bond-link/my-bond-links${query}`,
    { method: "GET" },
  );
}

/**
 * Propose a bond link. The caller must own at least one of the requested bonds.
 * Endpoint: POST /bond-link/create
 */
export function createBondLink(input: CreateBondLinkInput) {
  return apiClient<ApiResponse<RawBondLink>>("/bond-link/create", {
    method: "POST",
    body: input,
  });
}
