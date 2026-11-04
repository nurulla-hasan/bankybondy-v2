"use client";

import { useCallback, useEffect } from "react";
import { MapPin, SearchX, Users, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNextFilter } from "@/hooks/useNextFilter";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  PEOPLE_PAGE_SIZE,
  usePeople,
  useUpdateMyLocation,
} from "@/services";
import type { PersonSort } from "@/types";

import { PeopleFilters } from "./people-filters";
import { PersonCard } from "./person-card";

type PeopleFilterKey = "searchTerm" | "page" | "sort" | "online" | "near";

const isPersonSort = (value: string): value is PersonSort =>
  value === "featured" || value === "reputation";

export function PeopleDirectory() {
  const t = useTranslations("People");
  const { getFilter, updateBatch } = useNextFilter<PeopleFilterKey>();
  const updateLocation = useUpdateMyLocation();

  const searchTerm = getFilter("searchTerm");
  const sortParam = getFilter("sort");
  const sort = isPersonSort(sortParam) ? sortParam : undefined;
  const online = getFilter("online") === "true";
  const near = getFilter("near") === "true";
  const pageParam = Number(getFilter("page", "1"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const { data, isPending, isError, isFetching, refetch } = usePeople({
    page,
    limit: PEOPLE_PAGE_SIZE,
    searchTerm,
    sort,
    online: online ? "true" : undefined,
    near: near ? "true" : undefined,
  });

  useEffect(() => {
    if (!data || data.meta.totalPages < 1 || page <= data.meta.totalPages) {
      return;
    }

    updateBatch(
      { page: data.meta.totalPages <= 1 ? null : data.meta.totalPages },
      { resetPage: false },
    );
  }, [data, page, updateBatch]);

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

  const handlePageChange = (nextPage: number) => {
    updateBatch(
      { page: nextPage <= 1 ? null : nextPage },
      { resetPage: false },
    );
  };

  const handleToggleOnline = () => {
    updateBatch(
      { online: online ? null : "true", page: null },
      { resetPage: false },
    );
  };

  const handleToggleNear = () => {
    if (near) {
      updateBatch({ near: null, page: null }, { resetPage: false });
      return;
    }

    requestLocation(() => {
      updateBatch(
        { near: "true", sort: null, page: null },
        { resetPage: false },
      );
    });
  };

  const items = data?.result ?? [];
  const term = searchTerm.trim();
  const needsLocation = near && data?.needsLocation === true;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput />

        <PeopleFilters
          online={online}
          near={near}
          nearPending={updateLocation.isPending}
          onToggleOnline={handleToggleOnline}
          onToggleNear={handleToggleNear}
        />
      </div>

      {data && !isError && !needsLocation ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <p aria-live="polite">
            {t("resultCount", { count: data.meta.total })}
          </p>
          {online ? <span>{t("filters.onlineHint")}</span> : null}
        </div>
      ) : null}

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<WifiOff className="size-5" aria-hidden />}
          title={t("empty.errorTitle")}
          description={t("empty.errorDescription")}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              {t("empty.retry")}
            </Button>
          }
        />
      ) : needsLocation ? (
        <EmptyState
          icon={<MapPin className="size-5" aria-hidden />}
          title={t("empty.locationTitle")}
          description={t("empty.locationDescription")}
          action={
            <Button
              loading={updateLocation.isPending}
              loadingText={t("empty.locationAction")}
              onClick={() => requestLocation()}
            >
              {t("empty.locationAction")}
            </Button>
          }
        />
      ) : items.length ? (
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
            isFetching && "opacity-60 transition-opacity",
          )}
          aria-busy={isFetching}
        >
          {items.map((person) => (
            <PersonCard key={person._id} person={person} />
          ))}
        </div>
      ) : term ? (
        <EmptyState
          icon={<SearchX className="size-5" aria-hidden />}
          title={t("empty.searchTitle", { term })}
          description={t("empty.searchDescription")}
        />
      ) : (
        <EmptyState
          icon={<Users className="size-5" aria-hidden />}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      )}

      {data && !isError && !needsLocation ? (
        <CustomPagination
          currentPage={data.meta.page}
          totalPages={data.meta.totalPages}
          updatePage={handlePageChange}
        />
      ) : null}
    </div>
  );
}
