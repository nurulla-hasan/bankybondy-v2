export type GeolocationFailure =
  | "unsupported"
  | "insecure"
  | "denied"
  | "unavailable"
  | "timeout";

export interface Coordinates {
  lat: number;
  lng: number;
}

/** Browser blocks geolocation outside https (localhost excepted). */
export class GeolocationError extends Error {
  constructor(readonly reason: GeolocationFailure) {
    super(`geolocation_${reason}`);
    this.name = "GeolocationError";
  }
}

export function getGeolocationFailure(error: unknown): GeolocationFailure {
  if (error instanceof GeolocationError) return error.reason;
  return "unavailable";
}

const DEFAULT_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 300_000,
};

/**
 * One-shot `navigator.geolocation.getCurrentPosition`, resolved to plain
 * coordinates and rejected with a reason the UI can translate.
 */
export function requestCoordinates(
  options: PositionOptions = DEFAULT_OPTIONS
): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new GeolocationError("unsupported"));
      return;
    }
    if (!window.isSecureContext) {
      reject(new GeolocationError("insecure"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => {
        const reason: GeolocationFailure =
          error.code === error.PERMISSION_DENIED
            ? "denied"
            : error.code === error.TIMEOUT
              ? "timeout"
              : "unavailable";
        reject(new GeolocationError(reason));
      },
      options
    );
  });
}
