import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  BlockedListQueryParams,
  PeopleQueryParams,
  PersonBondsQueryParams,
  PersonRatingsQueryParams,
  RawBlockedList,
  RawBlockedUser,
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
 * Fetch one profile by NormalUser/profile id. The owner's own view keeps the
 * PII and location fields the directory strips, hence the payload type is a
 * parameter (`RawPersonProfile` for other people, `MyProfile` for yourself).
 * Endpoint: GET /normal-user/single-user/:id
 */
export function getPerson<T = RawPersonProfile>(id: string) {
  return apiClient<ApiResponse<T>>(
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
 * List the profiles I blocked, newest first.
 * Endpoint: GET /user-block/my-blocked-users
 */
export function getBlockedUsers(params?: BlockedListQueryParams) {
  return apiClient<ApiResponse<RawBlockedList>>(
    "/user-block/my-blocked-users",
    {
      method: "GET",
      query: params,
    },
  );
}

/**
 * Unblock by the blocked user's profile id — not the block doc id. Throws 404
 * "This user is not in your block list" when there is no such pair
 * (`userBlock.service.ts:114-126`).
 * Endpoint: DELETE /user-block/unblock/:id
 */
export function unblockUser(id: string) {
  return apiClient<ApiResponse<RawBlockedUser | null>>(
    `/user-block/unblock/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

/**
 * Report a NormalUser/profile id.
 * Endpoint: POST /report/create-report
 */ export function reportUser(input: ReportUserInput) {
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
