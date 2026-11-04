"use client";

import { MapPin, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

import { FilterSelect } from "@/components/common/filter-select";
import { Button } from "@/components/ui/button";

interface PeopleFiltersProps {
  online: boolean;
  near: boolean;
  nearPending: boolean;
  onToggleOnline: () => void;
  onToggleNear: () => void;
}

export function PeopleFilters({
  online,
  near,
  nearPending,
  onToggleOnline,
  onToggleNear,
}: PeopleFiltersProps) {
  const t = useTranslations("People");

  const sortOptions = [
    { value: "all", label: t("filters.sortDefault") },
    { value: "featured", label: t("filters.sortFeatured") },
    { value: "reputation", label: t("filters.sortReputation") },
  ];

  return (
    <div className="flex flex-col gap-2 lg:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          filterKey="sort"
          placeholder={t("filters.sortDefault")}
          options={sortOptions}
          align="start"
          disabled={near}
        />

        <Button
          type="button"
          variant={online ? "secondary" : "outline"}
          aria-pressed={online}
          onClick={onToggleOnline}
        >
          <Wifi className="size-4" aria-hidden />
          {t("filters.online")}
        </Button>

        <Button
          type="button"
          variant={near ? "secondary" : "outline"}
          aria-pressed={near}
          aria-busy={nearPending}
          loading={nearPending}
          loadingText={t("filters.near")}
          onClick={onToggleNear}
        >
          <MapPin className="size-4" aria-hidden />
          {t("filters.near")}
        </Button>
      </div>

      {near ? (
        <p className="text-xs text-muted-foreground">
          {t("filters.nearSortHint")}
        </p>
      ) : null}
    </div>
  );
}
