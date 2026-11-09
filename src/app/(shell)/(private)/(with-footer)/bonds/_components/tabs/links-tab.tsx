"use client";

import { Link2, SearchX, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { FilterSelect } from "@/components/common/filter-select";
import { TabsContent } from "@/components/ui/tabs";
import { useNextFilter } from "@/hooks/useNextFilter";
import { useBondLinks } from "@/services";
import type { RawBondLinkStatus } from "@/types";

import { BondLinkCard } from "../cards/bond-link-card";
import { BondLinkCardSkeleton } from "../cards/bond-link-card-skeleton";

interface LinksTabProps {
  searchTerm: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function LinksTab({ searchTerm, page, onPageChange }: LinksTabProps) {
  const t = useTranslations("Bonds");
  const { getFilter } = useNextFilter<"status">();
  const statusParam = getFilter("status");
  const status = (
    ["Ongoing", "Completed", "Canceled"] as const
  ).includes(statusParam as RawBondLinkStatus)
    ? (statusParam as RawBondLinkStatus)
    : undefined;

  const { data, isPending, isError, isFetching } = useBondLinks({
    searchTerm,
    page,
    status,
  });

  const links = data?.result ?? [];
  const term = searchTerm.trim();

  return (
    <TabsContent value="links" className="space-y-4">
      <h2 className="sr-only">{t("tabs.links")}</h2>

      <div className="flex justify-end">
        <FilterSelect
          filterKey="status"
          placeholder={t("linksFilter.all")}
          options={[
            { value: "all", label: t("linksFilter.all") },
            { value: "Ongoing", label: t("linksFilter.ongoing") },
            { value: "Completed", label: t("linksFilter.completed") },
            { value: "Canceled", label: t("linksFilter.canceled") },
          ]}
          className="w-full sm:w-52"
        />
      </div>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <BondLinkCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<WifiOff className="size-5" aria-hidden />}
          title={t("loadErrorTitle")}
          description={t("loadErrorDescription")}
        />
      ) : links.length ? (
        <div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-busy={isFetching}
        >
          {links.map((link) => (
            <BondLinkCard key={link._id} link={link} />
          ))}
        </div>
      ) : term ? (
        <EmptyState
          icon={<SearchX className="size-5" aria-hidden />}
          title={t("searchEmptyTitle", { term })}
          description={t("searchEmptyDescription")}
        />
      ) : (
        <EmptyState
          icon={<Link2 className="size-5" aria-hidden />}
          title={t("empty.linksTitle")}
          description={t("empty.linksDescription")}
        />
      )}

      {data && !isError ? (
        <CustomPagination
          currentPage={data.meta.page}
          totalPages={data.meta.totalPages}
          updatePage={onPageChange}
        />
      ) : null}
    </TabsContent>
  );
}
