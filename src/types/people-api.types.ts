import type { PaginationMeta } from "./api.types";

export type FriendStatus = "friend" | "following" | "follower" | "none";

export type PersonSort = "featured" | "reputation";

export interface RawReputation {
  avg?: number;
  count?: number;
  score?: number;
}

export interface RawPersonSkill {
  _id: string;
  name: string;
}

/**
 * Public people payloads use `_id` as the NormalUser/profile id. `user` is the
 * auth account id and must never be used for profile links or actions.
 */
export interface RawPerson {
  _id: string;
  user: string;
  name: string;
  profile_image?: string;
  cover_image?: string;
  gender?: string;
  address?: string;
  bio?: string;
  skills?: RawPersonSkill[];
  /** Backend stores a flat array of URLs (`normalUser.validation.ts`: array of `string().url()`). */
  socialLinks?: string[];
  bondsPublic?: boolean;
  listedInPeople?: boolean;
  reputation?: RawReputation;
  friendRequestStatus?: FriendStatus;
  distanceKm?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** `GET /normal-user/get-all-user` — pagination is nested inside `data`. */
export interface RawPeopleList {
  meta: PaginationMeta;
  result: RawPerson[];
  needsLocation?: boolean;
}

export interface PeopleQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  online?: "true";
  near?: "true";
  sort?: PersonSort;
}

/** `GET /normal-user/single-user/:id` — same public shape with live reputation. */
export interface RawPersonProfile extends Omit<RawPerson, "distanceKm"> {
  friendRequestStatus: FriendStatus;
  email?: string;
  phone?: string;
  subscriptionType?: string;
  bondLimit?: number;
  hasActiveBonds?: boolean;
}

export type RawPublicBondStatus =
  | "WAITING_FOR_LINK"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELED";

export type RawBondModality = "ONLINE" | "PHYSICAL" | "online" | "physical";

export interface RawPublicBond {
  _id: string;
  offer: string;
  want: string;
  description?: string;
  modality?: RawBondModality;
  radius?: number;
  status: RawPublicBondStatus;
  createdAt: string;
}

/** `GET /bond-request/by-user/:userId` — no `totalPages`; compute from count. */
export interface RawUserBonds {
  bondsPublic: boolean;
  count: number;
  bonds: RawPublicBond[];
  page: number;
  limit: number;
}

export interface PersonBondsQueryParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface RawRatingRater {
  _id: string;
  name?: string;
  profile_image?: string;
  reputation?: RawReputation;
}

export interface RawPublicRating {
  _id: string;
  rating: number;
  comment?: string;
  want?: string;
  offer?: string;
  ratedBy?: RawRatingRater | null;
  createdAt: string;
}

/** `GET /bond-rating/public/:userId` — pagination is nested inside `data`. */
export interface RawRatingsPage {
  meta: PaginationMeta;
  reputation: RawReputation;
  user: {
    _id: string;
    name?: string;
    profile_image?: string;
  };
  ratings: RawPublicRating[];
}

export interface PersonRatingsQueryParams {
  page?: number;
  limit?: number;
}

export type IncidentType =
  | "Unprofessional Behavior"
  | "Failure to collaborate"
  | "Spam"
  | "Other";

export interface SendFriendRequestInput {
  receiver: string;
}

export interface ReportUserInput {
  reportTo: string;
  incidentType: IncidentType;
}

export interface UpdateLocationInput {
  lat: number;
  lng: number;
  mode?: "auto" | "manual";
}

/**
 * `GET /user-block/my-blocked-users` row — the UserBlock doc with the target
 * populated as `name profile_image` only (`userBlock.service.ts:133-140`).
 * `_id` is the block doc id; `blocked._id` is the profile id unblock needs.
 */
export interface RawBlockedUser {
  _id: string;
  blocker: string;
  blocked: Pick<RawPerson, "_id" | "name" | "profile_image"> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawBlockedList {
  meta: PaginationMeta;
  result: RawBlockedUser[];
}

export interface BlockedListQueryParams {
  page?: number;
  limit?: number;
}
