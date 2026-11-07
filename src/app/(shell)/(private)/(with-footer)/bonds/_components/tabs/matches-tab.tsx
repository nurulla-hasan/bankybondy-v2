"use client";

import { ChevronDown, SearchX, Sparkles, WifiOff, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TabsContent } from "@/components/ui/tabs";
import { useBondMatches, useBondRequest } from "@/services";
import { cn } from "@/lib/utils";
import type { RawBondMatch } from "@/types";

import { MatchCard } from "../cards/match-card";
import { MatchCardSkeleton } from "../cards/match-card-skeleton";

function matchesSearchTerm(match: RawBondMatch, term: string) {
  return match.matchRequest.some((entry) => {
    const name = typeof entry.user === "object" ? entry.user?.name ?? "" : "";

    return `${name} ${entry.offer} ${entry.want}`.toLowerCase().includes(term);
  });
}

function matchSignature(match: RawBondMatch) {
  return match.matchRequest
    .map((entry) => entry._id)
    .sort()
    .join("|");
}

interface MatchesTabProps {
  requestFilterId: string | null;
  onClearFilter: () => void;
  onBrowseRequests: () => void;
  searchTerm: string;
}

export function MatchesTab({
  requestFilterId,
  onClearFilter,
  onBrowseRequests,
  searchTerm,
}: MatchesTabProps) {
  const t = useTranslations("Bonds");
  const { data: request } = useBondRequest(requestFilterId);
  const {
    data,
    isPending,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBondMatches(requestFilterId);

  // El mismo match puede repetirse entre páginas si el set se recomputó
  // mientras se iba paginando; la firma lo deduplica sin reordenar.
  const matches = useMemo(() => {
    const seen = new Set<string>();
    const result: RawBondMatch[] = [];

    for (const page of data?.pages ?? []) {
      for (const match of page.data.data) {
        const signature = matchSignature(match);

        if (seen.has(signature)) continue;
        seen.add(signature);
        result.push(match);
      }
    }

    return result;
  }, [data]);

  const status = data?.pages[0]?.data.status;
  const isComputing = status === "computing";
  const reactivated = data?.pages.some((page) => page.data.reactivated);
  const term = searchTerm.trim();
  const normalizedTerm = term.toLowerCase();

  const searchedMatches = normalizedTerm
    ? matches.filter((match) => matchesSearchTerm(match, normalizedTerm))
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

          {reactivated ? (
            <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              {t("matchesReactivated")}
            </p>
          ) : null}

          {isPending ? (
            <div className="space-y-4" aria-hidden>
              {Array.from({ length: 3 }, (_, index) => (
                <MatchCardSkeleton key={index} />
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
                isFetching &&
                  !isFetchingNextPage &&
                  "opacity-60 transition-opacity",
              )}
              aria-busy={isFetching}
            >
              {searchedMatches.map((match) => (
                <MatchCard key={matchSignature(match)} match={match} />
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

          {data && !isError && !isComputing && hasNextPage ? (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Spinner className="size-4" />
                ) : (
                  <ChevronDown className="size-4" aria-hidden />
                )}
                {isFetchingNextPage ? t("loadingMore") : t("loadMore")}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </TabsContent>
  );
}
