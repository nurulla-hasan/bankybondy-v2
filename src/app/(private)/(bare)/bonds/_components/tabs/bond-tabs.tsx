"use client";

import { ClipboardList, Link2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBondLinks, useBondMatches, useBondRequests } from "@/services";
import type { BondRequest } from "@/types";

import { LinksTab } from "./links-tab";
import { MatchesTab } from "./matches-tab";
import { RequestsTab } from "./requests-tab";

export type BondTab = "requests" | "matches" | "links";

interface BondTabsProps {
  activeTab: BondTab;
  onTabChange: (tab: BondTab) => void;
  requestFilterId: string | null;
  onClearFilter: () => void;
  onFindMatch: (request: BondRequest) => void;
}

export function BondTabs({
  activeTab,
  onTabChange,
  requestFilterId,
  onClearFilter,
  onFindMatch,
}: BondTabsProps) {
  const t = useTranslations("Bonds");
  const { data: requests } = useBondRequests();
  const { data: matches } = useBondMatches();
  const { data: links } = useBondLinks();

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
      onValueChange={(value) => onTabChange(value as BondTab)}
    >
      <TabsList aria-label={t("tabsLabel")} className="w-full sm:w-fit">
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

      <RequestsTab onFindMatch={onFindMatch} />
      <MatchesTab
        requestFilterId={requestFilterId}
        onClearFilter={onClearFilter}
      />
      <LinksTab />
    </Tabs>
  );
}
