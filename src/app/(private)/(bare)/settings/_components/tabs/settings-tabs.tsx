"use client";

import { CircleAlert, KeyRound, UserRoundCog } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNextFilter } from "@/hooks/useNextFilter";
import type { MyProfile } from "@/types";

import { DeleteAccountCard } from "../cards/delete-account-card";
import { ChangePasswordForm } from "../forms/change-password-form";
import { EditProfileForm } from "../forms/edit-profile-form";

type SettingsTab = "profile" | "security" | "account";

const SETTINGS_TABS: readonly SettingsTab[] = [
  "profile",
  "security",
  "account",
];
const DEFAULT_TAB: SettingsTab = "profile";

export function SettingsTabs({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Profile");
  const { getFilter, updateFilter } = useNextFilter<"settingsTab">();

  const tabValue = getFilter("settingsTab", DEFAULT_TAB) as SettingsTab;
  const activeTab = SETTINGS_TABS.includes(tabValue) ? tabValue : DEFAULT_TAB;

  const tabs = [
    {
      id: "profile" as const,
      icon: <UserRoundCog className="size-4" aria-hidden />,
      label: t("settings.tabProfile"),
    },
    {
      id: "security" as const,
      icon: <KeyRound className="size-4" aria-hidden />,
      label: t("settings.tabSecurity"),
    },
    {
      id: "account" as const,
      icon: <CircleAlert className="size-4" aria-hidden />,
      label: t("settings.tabAccount"),
    },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        updateFilter(
          "settingsTab",
          value === DEFAULT_TAB ? null : (value as SettingsTab),
        )
      }
      className="space-y-4"
    >
      <TabsList
        variant="line"
        aria-label={t("settings.tabsLabel")}
        className="w-full border-b sm:w-fit"
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex-1 sm:flex-none">
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="profile">
        <EditProfileForm profile={profile} />
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <ChangePasswordForm />
      </TabsContent>

      <TabsContent value="account" className="space-y-4">
        <DeleteAccountCard />
      </TabsContent>
    </Tabs>
  );
}
