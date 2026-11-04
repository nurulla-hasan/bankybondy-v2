import { apiClient } from "@/lib/api-client";
import { buildQueryString } from "@/lib/build-query-string";
import type {
  ApiResponse,
  BondMatchQueryParams,
  RawBondMatchList,
} from "@/types";

/**
 * Precomputed matches for one of the user's bond requests.
 * `status: 'computing'` means the robot is still producing the cache; poll it.
 * Endpoint: GET /bond-request/matching-bond?bondRequest=:id
 */
export function getBondMatches(params: BondMatchQueryParams) {
  const query = buildQueryString({
    bondRequest: params.bondRequest,
    page: params.page,
    limit: params.limit,
  });

  return apiClient<ApiResponse<RawBondMatchList>>(
    `/bond-request/matching-bond${query}`,
    { method: "GET" },
  );
}
