import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  FriendDecision,
  FriendListQueryParams,
  RawFriendList,
  RawFriendRequestItem,
  RawPendingFriendCount,
} from "@/types";

/**
 * Requests addressed to me that are still Pending. The path says `followers`,
 * but there is no follow graph — see `friendRequest.service.ts:322-339`.
 * Endpoint: GET /friend-request/followers
 */
export function getIncomingRequests(params?: FriendListQueryParams) {
  return apiClient<ApiResponse<RawFriendList>>("/friend-request/followers", {
    method: "GET",
    query: params,
  });
}

/**
 * Requests I sent that are still Pending.
 * Endpoint: GET /friend-request/following
 */
export function getSentRequests(params?: FriendListQueryParams) {
  return apiClient<ApiResponse<RawFriendList>>("/friend-request/following", {
    method: "GET",
    query: params,
  });
}

/**
 * Accepted pairs, blocked users already excluded server-side.
 * Endpoint: GET /friend-request/friends
 */
export function getFriends(params?: FriendListQueryParams) {
  return apiClient<ApiResponse<RawFriendList>>("/friend-request/friends", {
    method: "GET",
    query: params,
  });
}

/**
 * Number of Pending requests addressed to me, blocked senders excluded.
 * Endpoint: GET /friend-request/pending-count
 */
export function getPendingFriendCount() {
  return apiClient<ApiResponse<RawPendingFriendCount>>(
    "/friend-request/pending-count",
    { method: "GET" },
  );
}

/**
 * Accept or reject one request. `requestId` is the FriendRequest `_id` from a
 * list row — NOT the requester's profile id (`service.ts:93-101`).
 * Endpoint: PATCH /friend-request/accept-reject/:requestId
 */
export function respondFriendRequest(requestId: string, decision: FriendDecision) {
  return apiClient<ApiResponse<RawFriendRequestItem>>(
    `/friend-request/accept-reject/${encodeURIComponent(requestId)}`,
    { method: "PATCH", body: { status: decision } },
  );
}

/**
 * Withdraw a request I sent. Takes the other person's profile id
 * (`service.ts:457-461`); a no-match cancel still returns 200 with `data: null`.
 * Endpoint: DELETE /friend-request/cancel/:receiverId
 */
export function cancelFriendRequest(receiverId: string) {
  return apiClient<ApiResponse<RawFriendRequestItem | null>>(
    `/friend-request/cancel/${encodeURIComponent(receiverId)}`,
    { method: "DELETE" },
  );
}

/**
 * Break an accepted pair in either direction. Takes the other person's profile
 * id (`service.ts:466-479`); unfriending a non-friend returns 200 with
 * `data: null`, so the caller cannot tell a real change from a no-op.
 * Endpoint: DELETE /friend-request/unfriend/:friendId
 */
export function unfriendUser(friendId: string) {
  return apiClient<ApiResponse<RawFriendRequestItem | null>>(
    `/friend-request/unfriend/${encodeURIComponent(friendId)}`,
    { method: "DELETE" },
  );
}
