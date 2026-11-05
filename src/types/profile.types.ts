import type { RawPersonSkill, RawReputation } from "./people-api.types";

/** Backend `ENUM_GENDER` has exactly these two values. */
export type Gender = "MALE" | "FEMALE";

/** How the stored coordinates were obtained (`normalUser.services.ts:updateLocation`). */
export type LocationMode = "auto" | "manual";

/**
 * `GET /normal-user/single-user/:id` viewed by its owner: the full NormalUser
 * document with populated `skills` and live `reputation`. `_id` is the profile
 * id (used for people links); `user` is the auth account id.
 */
export interface MyProfile {
  _id: string;
  user: string;
  name: string;
  /** Read-only: the API rejects any attempt to change it. */
  email?: string;
  phone?: string;
  profile_image?: string;
  cover_image?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  skills?: RawPersonSkill[];
  socialLinks?: string[];
  bondsPublic?: boolean;
  listedInPeople?: boolean;
  reputation?: RawReputation;
  /** Raw coordinates are never sent to the client; only these two are. */
  locationMode?: LocationMode;
  locationUpdatedAt?: string;
  subscriptionType?: string;
  bondLimit?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Field subset the profile edit form owns; everything else is derived or read-only. */
export interface EditProfileValues {
  name: string;
  phone: string;
  gender: Gender | "";
  dateOfBirth: string;
  address: string;
  bio: string;
  skills: string[];
  socialLinks: string[];
}

/** Whitelisted by the backend; anything else in the payload is silently dropped. */
export interface UpdateProfileInput extends Partial<EditProfileValues> {
  profileImageFile?: File;
  coverImageFile?: File;
}

/** `PATCH /normal-user/bonds-visibility` body. */
export interface BondsVisibilityInput {
  bondsPublic: boolean;
}

/** `PATCH /normal-user/people-visibility` body. */
export interface PeopleVisibilityInput {
  listedInPeople: boolean;
}

/** The two toggles live on separate endpoints, one boolean each. */
export type VisibilityKey =
  | keyof BondsVisibilityInput
  | keyof PeopleVisibilityInput;
