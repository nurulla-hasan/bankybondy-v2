import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  deleteAccount,
  forgotPassword,
  getMyProfile,
  loginUser,
  logoutUser,
  oauthLogin,
  registerUser,
  resendResetCode,
  resendVerifyCode,
  resetPassword,
  verifyCode,
  verifyResetOtp,
} from "../api/auth.api";

/**
 * Hook to fetch the currently authenticated user's profile
 */
export function useGetMyProfile() {
  return useQuery({
    queryKey: ["auth", "profile"],
    queryFn: getMyProfile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to login user
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });
}

/**
 * Hook to register new user
 */
export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

/**
 * Hook to verify registration code / OTP
 */
export function useVerifyCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });
}

/**
 * Hook to resend registration code
 */
export function useResendVerifyCode() {
  return useMutation({
    mutationFn: resendVerifyCode,
  });
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

/**
 * Hook to verify reset OTP
 */
export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: verifyResetOtp,
  });
}

/**
 * Hook to set new password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

/**
 * Hook to resend reset OTP
 */
export function useResendResetCode() {
  return useMutation({
    mutationFn: resendResetCode,
  });
}

/**
 * Hook for OAuth Login (Google, Apple, etc.)
 */
export function useOAuthLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: oauthLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

/**
 * Hook for logging out
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.cancelQueries();
      queryClient.setQueryData(["auth", "profile"], null);
      queryClient.clear();
    },
  });
}

/**
 * Hook for deleting the logged-in account, permanently.
 *
 * `DELETE /user/delete-account` clears only the refresh cookie, and the edge
 * proxy trusts the access token signature without re-reading the database, so
 * the dead session would stay usable until it expires. Logging out right after
 * wipes both cookies, which is what an erased account should mean.
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      const result = await deleteAccount(password);
      await logoutUser().catch(() => undefined);
      return result;
    },
    onSuccess: () => {
      queryClient.cancelQueries();
      queryClient.clear();
    },
  });
}
