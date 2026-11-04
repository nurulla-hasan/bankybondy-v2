"use client";

import { Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useBondMatches, useBondRequests } from "@/services";

import { MatchCard } from "../cards/match-card";
import { EmptyState } from "../shared/empty-state";

export function MatchesTab({
  requestFilterId,
  onClearFilter,
}: {
  requestFilterId: string | null;
  onClearFilter: () => void;
}) {
  const t = useTranslations("Bonds");
  const { data: requests } = useBondRequests();
  const { data: matches } = useBondMatches();

  const filterRequest = requestFilterId
    ? requests.find((request) => request.id === requestFilterId)
    : undefined;

  const visibleMatches = filterRequest
    ? matches.filter((match) => match.requestId === filterRequest.id)
    : matches;

  return (
    <TabsContent value="matches" className="space-y-4">
      <h2 className="sr-only">{t("tabs.matches")}</h2>

      {filterRequest && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" size="lg">
            {t("matchesFor", { offer: filterRequest.offer })}
          </Badge>
          <Button variant="ghost" onClick={onClearFilter}>
            <X className="size-4" aria-hidden />
            {t("clearFilter")}
          </Button>
        </div>
      )}

      {visibleMatches.length ? (
        <div className="space-y-4">
          {visibleMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Sparkles className="size-5" aria-hidden />}
          title={t("empty.matchesTitle")}
          description={
            filterRequest
              ? t("empty.matchesFilteredDescription")
              : t("empty.matchesDescription")
          }
          action={
            filterRequest ? (
              <Button variant="outline" onClick={onClearFilter}>
                {t("clearFilter")}
              </Button>
            ) : undefined
          }
        />
      )}
    </TabsContent>
  );
}
