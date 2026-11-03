
export type AppError = {
  data?: { message?: string; error?: string };
  response?: { _data?: { message?: string; error?: string } };
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
