import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  OAuthLoginPayload,
  RefreshSessionResult,
  RegisterPayload,
  ResendVerifyCodePayload,
  ResetPasswordPayload,
  SocketTokenResult,
  VerifyCodePayload,
  VerifyResetOtpPayload,
} from "@/types";

/**
 * 1. User Login (Email + Password)
 * Endpoint: POST /auth/login
 */
export function loginUser(payload: LoginPayload) {
  return apiClient<ApiResponse<LoginResponse>>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

/**
 * 2. User Registration (Normal User)
 * Endpoint: POST /user/register-user
 */
export function registerUser(payload: RegisterPayload) {
  return apiClient<ApiResponse<{ email: string; user: AuthUser }>>(
    "/user/register-user",
    {
      method: "POST",
      body: payload,
    }
  );
}

/**
 * 3. Verify Registration Code
 * Endpoint: POST /user/verify-code
 */
export function verifyCode(payload: VerifyCodePayload) {
  return apiClient<ApiResponse<LoginResponse>>("/user/verify-code", {
    method: "POST",
    body: payload,
  });
}

/**
 * 4. Resend Registration Verification Code
 * Endpoint: POST /user/resend-verify-code
 */
export function resendVerifyCode(payload: ResendVerifyCodePayload) {
  return apiClient<ApiResponse<null>>("/user/resend-verify-code", {
    method: "POST",
    body: payload,
  });
}

/**
 * 5. Forgot Password (Initiate Reset Code)
 * Endpoint: POST /auth/forget-password
 */
export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiClient<ApiResponse<null>>("/auth/forget-password", {
    method: "POST",
    body: payload,
  });
}

/**
 * 6. Verify Reset OTP
 * Endpoint: POST /auth/verify-reset-otp
 */
export function verifyResetOtp(payload: VerifyResetOtpPayload) {
  return apiClient<ApiResponse<null>>("/auth/verify-reset-otp", {
    method: "POST",
    body: payload,
  });
}

/**
 * 7. Reset Password with verified code
 * Endpoint: POST /auth/reset-password
 */
export function resetPassword(payload: ResetPasswordPayload) {
  return apiClient<ApiResponse<null>>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

/**
 * 8. Resend Reset Code
 * Endpoint: POST /auth/resend-reset-code
 */
export function resendResetCode(payload: ForgotPasswordPayload) {
  return apiClient<ApiResponse<null>>("/auth/resend-reset-code", {
    method: "POST",
    body: payload,
  });
}

/**
 * 9. OAuth Login (Google, Apple, Facebook)
 * Endpoint: POST /auth/oauth-login
 */
export function oauthLogin(payload: OAuthLoginPayload) {
  return apiClient<ApiResponse<LoginResponse>>("/auth/oauth-login", {
    method: "POST",
    body: payload,
  });
}

/**
 * 10. Get Current Logged In Profile
 * Endpoint: GET /user/get-my-profile
 */
export function getMyProfile() {
  return apiClient<ApiResponse<AuthUser>>("/user/get-my-profile", {
    method: "GET",
  });
}

/**
 * 11. Change Password (Authenticated)
 * Endpoint: POST /auth/change-password
 * The server also re-issues both tokens and rewrites the HttpOnly cookies, so
 * the session survives the change instead of being logged out.
 */
export function changePassword(payload: ChangePasswordPayload) {
  return apiClient<ApiResponse<LoginResponse>>("/auth/change-password", {
    method: "POST",
    body: payload,
  });
}

/**
 * 12. Logout User
 * Endpoint: POST /auth/logout
 */
export function logoutUser() {
  return apiClient<ApiResponse<null>>("/auth/logout", {
    method: "POST",
  });
}

/**
 * 13. Delete the logged-in account and every profile, bond and rating hanging
 * off it. The password is re-checked server-side; a wrong one returns 403.
 * Endpoint: DELETE /user/delete-account
 */
export function deleteAccount(password: string) {
  return apiClient<ApiResponse<null>>("/user/delete-account", {
    method: "DELETE",
    body: { password },
  });
}

/**
 * 14. Mint a 30-minute JWT for the Socket.IO handshake. The access token lives
 * in an HttpOnly cookie, so the browser cannot read it; this endpoint hands the
 * socket its own short-lived token and the HTTP middleware refuses it
 * (`helper/socketToken.ts`).
 * Endpoint: GET /auth/socket-token
 */
export function getSocketToken() {
  return apiClient<ApiResponse<SocketTokenResult>>("/auth/socket-token", {
    method: "GET",
  });
}

/**
 * 15. Renew the access cookie. Browsers send the HttpOnly refresh cookie, so no
 * body is needed. Used when a socket-token mint comes back 401 because the
 * access cookie expired between page loads.
 * Endpoint: POST /auth/refresh-token
 */
export function refreshSession() {
  return apiClient<ApiResponse<RefreshSessionResult>>("/auth/refresh-token", {
    method: "POST",
  });
}
