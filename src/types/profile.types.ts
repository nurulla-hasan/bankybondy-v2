import type { RawPersonSkill, RawReputation } from "./people-api.types";

/** Backend `ENUM_GENDER` has exactly these two values. */
export type Gender = "MALE" | "FEMALE";

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

export interface ProfileVisibilityPatch {
  listedInPeople: boolean;
  bondsPublic: boolean;
}
