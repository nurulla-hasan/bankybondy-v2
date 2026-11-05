"use client";

import { BookOpenText, LayoutGrid, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNextFilter } from "@/hooks/useNextFilter";
import type { MyProfile, RawPublicBond, RawPublicRating } from "@/types";

import { BondsTab } from "./bonds-tab";
import { OverviewTab } from "./overview-tab";
import { ReviewsTab } from "./reviews-tab";

type ProfileTab = "overview" | "bonds" | "reviews";

const PROFILE_TABS: readonly ProfileTab[] = ["overview", "bonds", "reviews"];
const DEFAULT_TAB: ProfileTab = "overview";

interface ProfileTabsProps {
  profile: MyProfile;
  bonds: RawPublicBond[];
  reviews: RawPublicRating[];
}

export function ProfileTabs({ profile, bonds, reviews }: ProfileTabsProps) {
  const t = useTranslations("Profile");
  const { getFilter, updateFilter } = useNextFilter<"tab">();

  const tabValue = getFilter("tab", DEFAULT_TAB) as ProfileTab;
  const activeTab = PROFILE_TABS.includes(tabValue) ? tabValue : DEFAULT_TAB;

  const tabs = [
    {
      id: "overview" as const,
      icon: <LayoutGrid className="size-4" aria-hidden />,
      label: t("tabs.overview"),
    },
    {
      id: "bonds" as const,
      icon: <BookOpenText className="size-4" aria-hidden />,
      label: t("tabs.bonds"),
      count: bonds.length,
    },
    {
      id: "reviews" as const,
      icon: <Star className="size-4" aria-hidden />,
      label: t("tabs.reviews"),
      count: profile.reputation?.count ?? 0,
    },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        updateFilter(
          "tab",
          value === DEFAULT_TAB ? null : (value as ProfileTab),
        )
      }
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
            {typeof tab.count === "number" ? (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums group-data-active/tab-trigger:bg-primary/10 group-data-active/tab-trigger:text-primary">
                {tab.count}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>

      <OverviewTab profile={profile} />
      <BondsTab profile={profile} bonds={bonds} />
      <ReviewsTab reviews={reviews} reputation={profile.reputation} />
    </Tabs>
  );
}
