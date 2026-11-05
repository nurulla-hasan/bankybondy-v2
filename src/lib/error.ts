
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

function readStatus(err: AppError) {
  return err.status ?? err.statusCode ?? err.response?.status;
}

function readCode(err: AppError) {
  return err.data?.code ?? err.response?._data?.code ?? err.code;
}

/**
 * Hidden profiles return 403 with a machine-readable `PROFILE_HIDDEN` code.
 * Match on the code, never on the localized message.
 */
export function isProfileHiddenError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as AppError;

  return readStatus(err) === 403 && readCode(err) === "PROFILE_HIDDEN";
}

/**
 * The password changed after this token was issued, so the session on this
 * device is dead: re-authenticate instead of showing the raw 403.
 */
export function isPasswordChangedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as AppError;

  return readStatus(err) === 403 && readCode(err) === "PASSWORD_CHANGED";
}

/** Missing, blocked, and admin-blocked profiles all share an indistinguishable 404. */
export function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  return readStatus(error as AppError) === 404;
}
