"use client";

import { useGetMyProfile } from "@/services/hooks/auth.hook";

/**
 * Reusable hook to check authentication status and get current user details
 * across the application.
 */
export function useAuth() {
  const { data, isLoading, isError, refetch } = useGetMyProfile();

  const user = data?.data ?? null;
  // The profile endpoint returns a NormalUser document without a `role` field
  // (role only lives on the auth User model / JWT), and the endpoint itself is
  // already guarded server-side, so presence of the profile is enough.
  const isAuthenticated = Boolean(user?._id);

  return {
    user,
    isAuthenticated,
    isLoading,
    isError,
    refetch,
  };
}

export default useAuth;
