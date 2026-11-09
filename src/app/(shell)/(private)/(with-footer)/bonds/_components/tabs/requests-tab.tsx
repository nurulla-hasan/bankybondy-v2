"use client";

import { ClipboardList, SearchX, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { TabsContent } from "@/components/ui/tabs";
import { useBondRequests } from "@/services";
import type { RawBondRequest } from "@/types";

import { BondRequestCard } from "../cards/bond-request-card";
import { BondRequestCardSkeleton } from "../cards/bond-request-card-skeleton";
import { CreateBondDialog } from "../dialogs/create-bond-dialog";

interface RequestsTabProps {
  onFindMatch: (request: RawBondRequest) => void;
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

  const requests = data?.result ?? [];
  const term = searchTerm.trim();

  return (
    <TabsContent value="requests" className="space-y-4">
      <h2 className="sr-only">{t("tabs.requests")}</h2>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }, (_, index) => (
            <BondRequestCardSkeleton key={index} />
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
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-busy={isFetching}
        >
          {requests.map((request) => (
            <BondRequestCard
              key={request._id}
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
