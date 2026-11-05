import type { PaginationMeta } from "./api.types";

/**
 * `friendRequest.enum.ts:1-5`. The backend stores these capitalized, and the
 * accept/reject validation only accepts these exact strings.
 */
export type FriendRequestStatus = "Pending" | "Accepted" | "Rejected";

/** The two decisions a Pending request can be answered with. */
export type FriendDecision = Exclude<FriendRequestStatus, "Pending">;

/** The three lists the backend can return; see `friendRequest.service.ts`. */
export type FriendListKind = "requests" | "sent" | "friends";

/**
 * The person attached to a list row. Narrower than `RawPerson`: the friend
 * projections return `skills` as plain name strings (`service.ts:211-252`).
 * `_id` is the NormalUser/profile id — use it for `/people/:id` links and for
 * cancel/unfriend, never `user`.
 */
export interface RawFriendPerson {
  _id: string;
  name: string;
  profile_image?: string;
  skills?: string[];
}

/**
 * One row from any friend list. The populated person key differs per endpoint
 * (`friendInfo` for `/friends`, `followerInfo` for `/followers`,
 * `followingInfo` for `/following`), and `status` is always `Pending` in the
 * two request lists and `Accepted` in the friends list.
 */
export interface RawFriendRequestItem {
  /** FriendRequest id — the only id `PATCH /accept-reject/:id` accepts. */
  _id: string;
  status: FriendRequestStatus;
  createdAt?: string;
  updatedAt?: string;
  friendInfo?: RawFriendPerson;
  followerInfo?: RawFriendPerson;
  followingInfo?: RawFriendPerson;
}

/** Meta lives inside `data` for every list; controllers never pass top-level meta. */
export interface RawFriendList {
  meta: PaginationMeta;
  result: RawFriendRequestItem[];
}

export interface RawPendingFriendCount {
  count: number;
}

export interface FriendListQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}
