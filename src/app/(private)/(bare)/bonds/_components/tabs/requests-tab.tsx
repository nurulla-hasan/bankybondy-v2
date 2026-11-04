"use client";

import { ClipboardList, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

import { TabsContent } from "@/components/ui/tabs";
import { useBondRequests } from "@/services";
import type { BondRequest } from "@/types";

import { BondRequestCard } from "../cards/bond-request-card";
import { CreateBondDialog } from "../dialogs/create-bond-dialog";
import { EmptyState } from "../shared/empty-state";

export function RequestsTab({
  onFindMatch,
  searchTerm,
}: {
  onFindMatch: (request: BondRequest) => void;
  searchTerm: string;
}) {
  const t = useTranslations("Bonds");
  const { data: requests } = useBondRequests();

  const term = searchTerm.trim().toLowerCase();
  const visibleRequests = term
    ? requests.filter((request) =>
        `${request.offer} ${request.want}`.toLowerCase().includes(term),
      )
    : requests;

  return (
    <TabsContent value="requests" className="space-y-4">
      <h2 className="sr-only">{t("tabs.requests")}</h2>

      {visibleRequests.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleRequests.map((request) => (
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
          title={t("searchEmptyTitle", { term: searchTerm.trim() })}
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
    </TabsContent>
  );
}
