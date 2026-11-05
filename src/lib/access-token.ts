import type { UserRole } from "@/types";

interface AccessTokenClaims {
  role?: UserRole;
}

function decodePayload(token: string) {
  const base64 = token.split(".")[1];
  if (!base64) return null;

  const padded = base64
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));

  return JSON.parse(new TextDecoder().decode(bytes)) as AccessTokenClaims;
}

/**
 * Reads the `role` claim straight out of the access token the login response
 * returns. Unverified on purpose: this is a UX guard that keeps an admin out of
 * the member screens right after sign-in; the server still authorizes every
 * request, and the cookie token is what it reads.
 */
export function readRoleFromAccessToken(
  token?: string
): UserRole | null {
  if (!token) return null;

  try {
    return decodePayload(token)?.role ?? null;
  } catch {
    return null;
  }
}
