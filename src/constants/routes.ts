export const PRIVATE_ROUTES = [
  "/profile",
  "/settings",
  "/bonds",
  "/chatting",
  "/message",
  "/friends",
] as const;

export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-code",
] as const;

export const USER_HOME = "/" as const;
