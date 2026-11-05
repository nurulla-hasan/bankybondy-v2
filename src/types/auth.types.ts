import type { Gender } from "./profile.types";
import type { RawReputation } from "./people-api.types";

export type UserRole = "user" | "admin" | "superAdmin";

/**
 * `GET /user/get-my-profile` answers with the raw NormalUser profile document,
 * so `_id` is the profile id and `user` is the auth account id. The account
 * fields (`role`, `isVerified`, `isActive`, `isBlocked`) live on the separate
 * auth `User` model and are NOT part of this payload. `skills` are unpopulated
 * ObjectIds and `reputation` is the cached copy — use `MyProfile` (single-user)
 * when rendering the profile itself.
 */
export interface AuthUser {
  _id: string;
  user?: string;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  cover_image?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: string[];
  bondsPublic?: boolean;
  listedInPeople?: boolean;
  reputation?: RawReputation;
  subscriptionType?: string;
  bondLimit?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * `POST /auth/login` returns tokens only — no user object. Browsers get the
 * refresh token as an HttpOnly cookie, so it is absent from the JSON body.
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  skills?: string[];
}


export interface VerifyCodePayload {
  email: string;
  verifyCode: number;
}

export interface ResendVerifyCodePayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  resetCode: number;
}

export interface ResetPasswordPayload {
  email: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/** The service compares all three: `confirmNewPassword` is required, not client-side only. */
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface OAuthLoginPayload {
  provider: "google" | "apple" | "facebook";
  token: string;
  role?: string;
}
