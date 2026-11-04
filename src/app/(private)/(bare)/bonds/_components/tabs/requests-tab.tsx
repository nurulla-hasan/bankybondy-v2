"use client";

import { ClipboardList, SearchX, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { useBondRequests } from "@/services";
import { cn } from "@/lib/utils";
import type { BondRequest } from "@/types";

import { BondRequestCard } from "../cards/bond-request-card";
import { CreateBondDialog } from "../dialogs/create-bond-dialog";
import { EmptyState } from "../shared/empty-state";

interface RequestsTabProps {
  onFindMatch: (request: BondRequest) => void;
  searchTerm: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function RequestsTab({
  onFindMatch,
  searchTerm,
  page,
  onPageChange,
}: RequestsTabProps) {
  const t = useTranslations("Bonds");
  const { data, isPending, isError, isFetching } = useBondRequests({
    searchTerm,
    page,
  });

  const requests = data?.items ?? [];
  const term = searchTerm.trim();

  return (
    <TabsContent value="requests" className="space-y-4">
      <h2 className="sr-only">{t("tabs.requests")}</h2>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<WifiOff className="size-5" aria-hidden />}
          title={t("loadErrorTitle")}
          description={t("loadErrorDescription")}
        />
      ) : requests.length ? (
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
            isFetching && "opacity-60 transition-opacity",
          )}
          aria-busy={isFetching}
        >
          {requests.map((request) => (
            <BondRequestCard
              key={request.id}
              request={request}
              onFindMatch={onFindMatch}
            />
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
          icon={<ClipboardList className="size-5" aria-hidden />}
          title={t("empty.requestsTitle")}
          description={t("empty.requestsDescription")}
          action={<CreateBondDialog />}
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
