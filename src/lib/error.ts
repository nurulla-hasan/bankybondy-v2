
export type AppError = {
  data?: { message?: string; error?: string; code?: string };
  response?: {
    status?: number;
    _data?: { message?: string; error?: string; code?: string };
  };
  status?: number;
  statusCode?: number;
  code?: string;
  message?: string;
};

/**
 * Safely extracts a user-friendly error message from any error object,
 * including ofetch FetchError, standard Error instances, or backend API responses.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!error) return fallback;

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    const err = error as AppError;

    return (
      err.data?.message ||
      err.data?.error ||
      err.response?._data?.message ||
      err.response?._data?.error ||
      err.message ||
      fallback
    );
  }

  return fallback;
}

/**
 * Hidden profiles return 403 with a machine-readable `PROFILE_HIDDEN` code.
 * Match on the code, never on the localized message.
 */
export function isProfileHiddenError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as AppError;
  const status = err.status ?? err.statusCode ?? err.response?.status;
  const code = err.data?.code ?? err.response?._data?.code ?? err.code;

  return status === 403 && code === "PROFILE_HIDDEN";
}

/** Missing, blocked, and admin-blocked profiles all share an indistinguishable 404. */
export function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as AppError;
  const status = err.status ?? err.statusCode ?? err.response?.status;

  return status === 404;
}
