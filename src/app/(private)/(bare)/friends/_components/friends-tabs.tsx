"use client";

import { Inbox, Send, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNextFilter } from "@/hooks/useNextFilter";
import { useFriendList } from "@/services";
import type { FriendListKind } from "@/types";

import { FriendList } from "./friend-list";

const FRIEND_TABS: readonly FriendListKind[] = ["requests", "sent", "friends"];
const DEFAULT_TAB: FriendListKind = "requests";

type FriendsFilterKey = "tab" | "page";

export function FriendsTabs() {
  const t = useTranslations("Friends");
  const { getFilter, updateFilter } = useNextFilter<FriendsFilterKey>();

  const tabParam = getFilter("tab", DEFAULT_TAB) as FriendListKind;
  const activeTab = FRIEND_TABS.includes(tabParam) ? tabParam : DEFAULT_TAB;
  const pageParam = Number(getFilter("page", "1"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const { data: requests } = useFriendList("requests");
  const { data: sent } = useFriendList("sent");
  const { data: friends } = useFriendList("friends");

  const handleTabChange = (tab: FriendListKind) => {
    updateFilter("tab", tab === DEFAULT_TAB ? null : tab);
  };

  const handlePageChange = (nextPage: number) => {
    updateFilter("page", nextPage <= 1 ? null : nextPage, {
      resetPage: false,
    });
  };

  const tabs = [
    {
      id: "requests" as const,
      icon: <Inbox className="size-4" aria-hidden />,
      label: t("tabs.requests"),
      count: requests?.meta.total ?? 0,
    },
    {
      id: "sent" as const,
      icon: <Send className="size-4" aria-hidden />,
      label: t("tabs.sent"),
      count: sent?.meta.total ?? 0,
    },
    {
      id: "friends" as const,
      icon: <Users className="size-4" aria-hidden />,
      label: t("tabs.friends"),
      count: friends?.meta.total ?? 0,
    },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => handleTabChange(value as FriendListKind)}
      className="space-y-4"
    >
      <TabsList
        variant="line"
        aria-label={t("tabsLabel")}
        className="w-full border-b sm:w-fit"
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex-1 sm:flex-none">
            {tab.icon}
            {tab.label}
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums group-data-active/tab-trigger:bg-primary/10 group-data-active/tab-trigger:text-primary">
              {tab.count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      <FriendList kind={activeTab} page={page} onPageChange={handlePageChange} />
    </Tabs>
  );
}
