import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  BondRequestQueryParams,
  CreateBondRequestInput,
  RawBondRequest,
  RawBondRequestList,
} from "@/types";

/**
 * List the authenticated user's bond requests.
 * Endpoint: GET /bond-request/my-bond-requests
 */
export function getMyBondRequests(params?: BondRequestQueryParams) {
  return apiClient<ApiResponse<RawBondRequestList>>(
    "/bond-request/my-bond-requests",
    { method: "GET", query: params },
  );
}

/** Fetch a single bond request by id (owner or active/navigable).
 * Endpoint: GET /bond-request/get-single-bond-request/:id
 */
export function getBondRequestById(id: string) {
  return apiClient<ApiResponse<RawBondRequest>>(
    `/bond-request/get-single-bond-request/${id}`,
    { method: "GET" },
  );
}

/**
 * Create a bond request for the authenticated user.
 * Endpoint: POST /bond-request/create
 */
export function createBondRequest(input: CreateBondRequestInput) {
  return apiClient<ApiResponse<RawBondRequest>>("/bond-request/create", {
    method: "POST",
    body: input,
  });
}

/**
 * Pause or resume a bond request. Editing other fields is rejected by the API.
 * Endpoint: PATCH /bond-request/update/:id
 */
export function setBondRequestPaused(id: string, isPause: boolean) {
  return apiClient<ApiResponse<RawBondRequest>>(`/bond-request/update/${id}`, {
    method: "PATCH",
    body: { isPause },
  });
}

/**
 * Soft-delete a bond request.
 * Endpoint: DELETE /bond-request/delete/:id
 */
export function deleteBondRequest(id: string) {
  return apiClient<ApiResponse<RawBondRequest>>(`/bond-request/delete/${id}`, {
    method: "DELETE",
  });
}
