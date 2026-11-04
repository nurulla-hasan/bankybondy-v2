"use client";

import { useGetMyProfile } from "@/services/hooks/auth.hook";

/**
 * Reusable hook to check authentication status and get current user details
 * across the application.
 */
export function useAuth() {
  const { data, isLoading, isError, refetch } = useGetMyProfile();

  const user = data?.data ?? null;
  const isAuthenticated = Boolean(user?._id && user?.role === "user");

  return {
    user,
    isAuthenticated,
    isLoading,
    isError,
    refetch,
  };
}

export default useAuth;
