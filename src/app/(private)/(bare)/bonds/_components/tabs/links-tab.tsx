"use client";

import { Link2, SearchX, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { useBondLinks } from "@/services";
import { cn } from "@/lib/utils";

import { BondLinkCard } from "../cards/bond-link-card";
import { EmptyState } from "../shared/empty-state";

interface LinksTabProps {
  searchTerm: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function LinksTab({ searchTerm, page, onPageChange }: LinksTabProps) {
  const t = useTranslations("Bonds");
  const { data, isPending, isError, isFetching } = useBondLinks({
    searchTerm,
    page,
  });

  const links = data?.items ?? [];
  const term = searchTerm.trim();

  return (
    <TabsContent value="links" className="space-y-4">
      <h2 className="sr-only">{t("tabs.links")}</h2>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-60 rounded-2xl" />
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
          className={cn(
            "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
            isFetching && "opacity-60 transition-opacity",
          )}
          aria-busy={isFetching}
        >
          {links.map((link) => (
            <BondLinkCard key={link.id} link={link} />
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
