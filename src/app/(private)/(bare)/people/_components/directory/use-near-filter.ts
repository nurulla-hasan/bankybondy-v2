"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

import { useNextFilter } from "@/hooks/useNextFilter";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { useUpdateMyLocation } from "@/services";

export function useNearFilter() {
  const t = useTranslations("People");
  const { getFilter, updateBatch } = useNextFilter();
  const updateLocation = useUpdateMyLocation();

  const near = getFilter("near") === "true";

  const requestLocation = useCallback(
    (onSuccess?: () => void) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        errorToast(t("filters.nearUnsupported"));
        return;
      }

      if (!window.isSecureContext) {
        errorToast(t("filters.nearUnavailable"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation.mutate(
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              mode: "auto",
            },
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
        (error) => {
          if (error.code === error.TIMEOUT) {
            errorToast(t("filters.nearTimeout"));
            return;
          }

          errorToast(
            t("filters.nearDenied"),
            t("filters.nearDeniedDescription"),
          );
        },
        { timeout: 10_000, maximumAge: 300_000 },
      );
    },
    [t, updateLocation],
  );

  const toggleNear = () => {
    if (near) {
      updateBatch({ near: null, page: null }, { resetPage: false });
      return;
    }

    requestLocation(() => {
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
