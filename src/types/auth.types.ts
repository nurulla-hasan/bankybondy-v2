export type UserRole = "user" | "admin" | "superAdmin";

export interface AuthUser {
  _id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  name?: string;
  profile_image?: string;
  cover_image?: string;
  phone?: string;
  address?: string;
  bio?: string;
  subscriptionType?: string;
  bondLimit?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
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
  verifyCode: number | string;
}

export interface ResendVerifyCodePayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  resetCode: number | string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  oldPassword?: string;
  newPassword: string;
}

export interface OAuthLoginPayload {
  provider: "google" | "apple" | "facebook";
  token: string;
  role?: string;
}
