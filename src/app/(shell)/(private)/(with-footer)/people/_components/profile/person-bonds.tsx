"use client";

import { useEffect, useRef } from "react";
import { Link2, Lock, SearchX, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNextFilter } from "@/hooks/useNextFilter";
import { PERSON_BONDS_PAGE_SIZE, usePersonBonds } from "@/services";
import type { RawPublicBond } from "@/types";

import { PublicBondCard } from "./public-bond-card";

type BondsFilterKey = "searchTerm" | "bondsPage";

interface PersonBondsProps {
  personId: string;
  selectedBondId: string | null;
  onSelectBond: (bond: RawPublicBond | null) => void;
}

export function PersonBonds({
  personId,
  selectedBondId,
  onSelectBond,
}: PersonBondsProps) {
  const t = useTranslations("People");
  const { getFilter, updateBatch } = useNextFilter<BondsFilterKey>();
  const previousTermRef = useRef<string | null>(null);

  const searchTerm = getFilter("searchTerm");
  const pageParam = Number(getFilter("bondsPage", "1"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const term = searchTerm.trim();

  const { data, isPending, isError, isFetching, refetch } = usePersonBonds(
    personId,
    { searchTerm, page, limit: PERSON_BONDS_PAGE_SIZE },
  );

  useEffect(() => {
    if (previousTermRef.current === null) {
      previousTermRef.current = searchTerm;
      return;
    }

    if (previousTermRef.current === searchTerm) return;

    previousTermRef.current = searchTerm;
    onSelectBond(null);
    updateBatch({ bondsPage: null }, { resetPage: false });
  }, [searchTerm, updateBatch, onSelectBond]);

  const totalPages = data
    ? Math.max(1, Math.ceil(data.count / Math.max(data.limit, 1)))
    : 0;

  useEffect(() => {
    if (!data || totalPages < 1 || page <= totalPages) {
      return;
    }

    updateBatch(
      { bondsPage: totalPages <= 1 ? null : totalPages },
      { resetPage: false },
    );
  }, [data, page, totalPages, updateBatch]);

  const handlePageChange = (nextPage: number) => {
    onSelectBond(null);
    updateBatch(
      { bondsPage: nextPage <= 1 ? null : nextPage },
      { resetPage: false },
    );
  };

  const bonds = data?.bonds ?? [];
  const bondsHidden = data ? !data.bondsPublic : false;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-lg font-semibold">{t("profile.bonds")}</h2>
        <SearchInput />
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<WifiOff className="size-5" aria-hidden />}
          title={t("profile.bondsLoadErrorTitle")}
          description={t("profile.bondsLoadErrorDescription")}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              {t("empty.retry")}
            </Button>
          }
        />
      ) : bondsHidden ? (
        <EmptyState
          icon={<Lock className="size-5" aria-hidden />}
          title={
            data && data.count > 0
              ? t("profile.privateBonds", { count: data.count })
              : t("profile.bondsEmptyTitle")
          }
          description={t("profile.privateBondsDescription")}
        />
      ) : bonds.length ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-busy={isFetching}
        >
          {bonds.map((bond) => (
            <PublicBondCard
              key={bond._id}
              bond={bond}
              selected={bond._id === selectedBondId}
              onSelect={() => onSelectBond(bond)}
            />
          ))}
        </div>
      ) : term ? (
        <EmptyState
          icon={<SearchX className="size-5" aria-hidden />}
          title={t("profile.bondsSearchEmptyTitle", { term })}
          description={t("profile.bondsSearchEmptyDescription")}
        />
      ) : (
        <EmptyState
          icon={<Link2 className="size-5" aria-hidden />}
          title={t("profile.bondsEmptyTitle")}
          description={t("profile.bondsEmptyDescription")}
        />
      )}

      {data && !isError && !bondsHidden ? (
        <CustomPagination
          currentPage={data.page}
          totalPages={totalPages}
          updatePage={handlePageChange}
        />
      ) : null}
    </section>
  );
}
