"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

import { useNextFilter } from "@/hooks/useNextFilter";
import {
  getGeolocationFailure,
  requestCoordinates,
  type Coordinates,
} from "@/lib/geolocation";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { useUpdateMyLocation } from "@/services";

export function useNearFilter() {
  const t = useTranslations("People");
  const { getFilter, updateBatch } = useNextFilter();
  const updateLocation = useUpdateMyLocation();

  const near = getFilter("near") === "true";

  const requestLocation = useCallback(
    async (onSuccess?: () => void) => {
      let coords: Coordinates | null = null;
      try {
        coords = await requestCoordinates();
      } catch (error) {
        const failure = getGeolocationFailure(error);
        if (failure === "timeout") {
          errorToast(t("filters.nearTimeout"));
        } else if (failure === "unsupported") {
          errorToast(t("filters.nearUnsupported"));
        } else if (failure === "insecure") {
          errorToast(t("filters.nearUnavailable"));
        } else {
          errorToast(
            t("filters.nearDenied"),
            t("filters.nearDeniedDescription"),
          );
        }
        return;
      }

      updateLocation.mutate(
        { lat: coords.lat, lng: coords.lng, mode: "auto" },
        {
          onSuccess: () => {
            successToast(
              t("filters.nearUpdated"),
              t("filters.nearUpdatedDescription"),
            );
            onSuccess?.();
          },
          onError: (error) =>
            errorToast(t("filters.nearDenied"), getErrorMessage(error)),
        },
      );
    },
    [t, updateLocation],
  );

  const toggleNear = () => {
    if (near) {
      updateBatch({ near: null, page: null }, { resetPage: false });
      return;
    }

    void requestLocation(() => {
      updateBatch({ near: "true", sort: null, page: null }, { resetPage: false });
    });
  };

  return {
    near,
    nearPending: updateLocation.isPending,
    toggleNear,
    requestLocation,
  };
}
