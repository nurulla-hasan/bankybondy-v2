"use client";

import { SearchX, Sparkles, WifiOff, X } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { TabsContent } from "@/components/ui/tabs";
import { useBondMatches, useBondRequest } from "@/services";
import { cn } from "@/lib/utils";

import { MatchCard } from "../cards/match-card";

interface MatchesTabProps {
  requestFilterId: string | null;
  onClearFilter: () => void;
  onBrowseRequests: () => void;
  searchTerm: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function MatchesTab({
  requestFilterId,
  onClearFilter,
  onBrowseRequests,
  searchTerm,
  page,
  onPageChange,
}: MatchesTabProps) {
  const t = useTranslations("Bonds");
  const { data: request } = useBondRequest(requestFilterId);
  const { data, isPending, isError, isFetching } = useBondMatches(
    requestFilterId,
    page,
  );

  const matches = data?.items ?? [];
  const isComputing = data?.status === "computing";
  const term = searchTerm.trim();
  const normalizedTerm = term.toLowerCase();

  const searchedMatches = normalizedTerm
    ? matches.filter((match) =>
        match.participants.some((participant) =>
          `${participant.name} ${participant.offer} ${participant.want}`
            .toLowerCase()
            .includes(normalizedTerm),
        ),
      )
    : matches;

  return (
    <TabsContent value="matches" className="space-y-4">
      <h2 className="sr-only">{t("tabs.matches")}</h2>

      {!requestFilterId ? (
        <EmptyState
          icon={<Sparkles className="size-5" aria-hidden />}
          title={t("empty.matchesNoRequestTitle")}
          description={t("empty.matchesNoRequestDescription")}
          action={
            <Button variant="outline" onClick={onBrowseRequests}>
              {t("browseRequests")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {request ? (
              <Badge variant="secondary" size="lg">
                {t("matchesFor", { offer: request.offer })}
              </Badge>
            ) : null}
            <Button variant="ghost" onClick={onClearFilter}>
              <X className="size-4" aria-hidden />
              {t("clearFilter")}
            </Button>
          </div>

          {data?.reactivated ? (
            <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              {t("matchesReactivated")}
            </p>
          ) : null}

          {isPending ? (
            <div className="space-y-4" aria-hidden>
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={<WifiOff className="size-5" aria-hidden />}
              title={t("loadErrorTitle")}
              description={t("loadErrorDescription")}
            />
          ) : isComputing ? (
            <EmptyState
              icon={<Spinner className="size-5" />}
              title={t("matchesComputingTitle")}
              description={t("matchesComputingDescription")}
            />
          ) : searchedMatches.length ? (
            <div
              className={cn(
                "space-y-4",
                isFetching && "opacity-60 transition-opacity",
              )}
              aria-busy={isFetching}
            >
              {searchedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
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
              icon={<Sparkles className="size-5" aria-hidden />}
              title={t("empty.matchesTitle")}
              description={t("empty.matchesFilteredDescription")}
            />
          )}

          {data && !isError && !isComputing ? (
            <CustomPagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              updatePage={onPageChange}
            />
          ) : null}
        </>
      )}
    </TabsContent>
  );
}
