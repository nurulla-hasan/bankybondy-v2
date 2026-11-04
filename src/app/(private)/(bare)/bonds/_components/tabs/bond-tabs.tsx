"use client";

import { ClipboardList, Link2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { SearchInput } from "@/components/common/search-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNextFilter } from "@/hooks/useNextFilter";
import { useBondLinks, useBondMatches, useBondRequests } from "@/services";
import type { BondRequest } from "@/types";

import { LinksTab } from "./links-tab";
import { MatchesTab } from "./matches-tab";
import { RequestsTab } from "./requests-tab";

export type BondTab = "requests" | "matches" | "links";

type BondFilterKey = "tab" | "request" | "searchTerm";

const BOND_TABS: readonly BondTab[] = ["requests", "matches", "links"];
const DEFAULT_TAB: BondTab = "requests";

export function BondTabs() {
  const t = useTranslations("Bonds");
  const { getFilter, updateFilter, updateBatch } =
    useNextFilter<BondFilterKey>();

  const tabValue = getFilter("tab", DEFAULT_TAB) as BondTab;
  const activeTab = BOND_TABS.includes(tabValue) ? tabValue : DEFAULT_TAB;
  const requestFilterId = getFilter("request") || null;
  const searchTerm = getFilter("searchTerm");

  const { data: requests } = useBondRequests();
  const { data: matches } = useBondMatches();
  const { data: links } = useBondLinks();

  const handleTabChange = (tab: BondTab) => {
    updateFilter("tab", tab === DEFAULT_TAB ? null : tab);
  };

  const handleFindMatch = (request: BondRequest) => {
    updateBatch({ tab: "matches", request: request.id });
  };

  const tabs = [
    {
      id: "requests" as const,
      icon: <ClipboardList className="size-4" aria-hidden />,
      label: t("tabs.requests"),
      count: requests.length,
    },
    {
      id: "matches" as const,
      icon: <Sparkles className="size-4" aria-hidden />,
      label: t("tabs.matches"),
      count: matches.length,
    },
    {
      id: "links" as const,
      icon: <Link2 className="size-4" aria-hidden />,
      label: t("tabs.links"),
      count: links.length,
    },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => handleTabChange(value as BondTab)}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList
          variant="line"
          aria-label={t("tabsLabel")}
          className="w-full sm:w-fit border-b"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex-1 sm:flex-none"
            >
              {tab.icon}
              {tab.label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums group-data-active/tab-trigger:bg-primary/10 group-data-active/tab-trigger:text-primary">
                {tab.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <SearchInput />
      </div>

      <RequestsTab onFindMatch={handleFindMatch} searchTerm={searchTerm} />
      <MatchesTab
        requestFilterId={requestFilterId}
        onClearFilter={() => updateFilter("request", null)}
        searchTerm={searchTerm}
      />
      <LinksTab searchTerm={searchTerm} />
    </Tabs>
  );
}
