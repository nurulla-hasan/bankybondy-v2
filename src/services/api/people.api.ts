import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PeopleQueryParams,
  PersonBondsQueryParams,
  PersonRatingsQueryParams,
  RawPeopleList,
  RawPersonProfile,
  RawRatingsPage,
  RawUserBonds,
  ReportUserInput,
  SendFriendRequestInput,
  UpdateLocationInput,
} from "@/types";

/**
 * List public people (self, blocked, hidden, and admin-blocked excluded).
 * Endpoint: GET /normal-user/get-all-user
 */
export function getPeople(params?: PeopleQueryParams) {
  return apiClient<ApiResponse<RawPeopleList>>("/normal-user/get-all-user", {
    method: "GET",
    query: params,
  });
}

/**
 * Fetch one public profile by NormalUser/profile id.
 * Endpoint: GET /normal-user/single-user/:id
 */
export function getPerson(id: string) {
  return apiClient<ApiResponse<RawPersonProfile>>(
    `/normal-user/single-user/${encodeURIComponent(id)}`,
    { method: "GET" },
  );
}

/**
 * Fetch a person's live public bonds.
 * Endpoint: GET /bond-request/by-user/:userId
 */
export function getPersonBonds(
  userId: string,
  params?: PersonBondsQueryParams,
) {
  return apiClient<ApiResponse<RawUserBonds>>(
    `/bond-request/by-user/${encodeURIComponent(userId)}`,
    { method: "GET", query: params },
  );
}

/**
 * Fetch a person's applied public ratings.
 * Endpoint: GET /bond-rating/public/:userId
 */
export function getPersonRatings(
  userId: string,
  params?: PersonRatingsQueryParams,
) {
  return apiClient<ApiResponse<RawRatingsPage>>(
    `/bond-rating/public/${encodeURIComponent(userId)}`,
    { method: "GET", query: params },
  );
}

/**
 * Send a friend request to a NormalUser/profile id.
 * Endpoint: POST /friend-request/send
 */
export function sendFriendRequest(input: SendFriendRequestInput) {
  return apiClient<ApiResponse<unknown>>("/friend-request/send", {
    method: "POST",
    body: input,
  });
}

/**
 * Block a NormalUser/profile id.
 * Endpoint: POST /user-block/block/:id
 */
export function blockUser(id: string) {
  return apiClient<ApiResponse<unknown>>(
    `/user-block/block/${encodeURIComponent(id)}`,
    { method: "POST" },
  );
}

/**
 * Report a NormalUser/profile id.
 * Endpoint: POST /report/create-report
 */
export function reportUser(input: ReportUserInput) {
  return apiClient<ApiResponse<unknown>>("/report/create-report", {
    method: "POST",
    body: input,
  });
}

/**
 * Store the viewer's coordinates so the near-me listing can rank people.
 * Endpoint: PATCH /normal-user/update-location
 */
export function updateMyLocation(input: UpdateLocationInput) {
  return apiClient<ApiResponse<unknown>>("/normal-user/update-location", {
    method: "PATCH",
    body: input,
  });
}
