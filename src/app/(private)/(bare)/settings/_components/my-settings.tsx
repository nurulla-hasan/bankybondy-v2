"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useMockMyProfile } from "@/app/(private)/(bare)/profile/_components/use-mock-my-profile";

import { SettingsTabs } from "./tabs/settings-tabs";

function SettingsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-9 w-full max-w-md" />
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}

export function MySettings() {
  const { data, isPending } = useMockMyProfile();

  if (isPending || !data) return <SettingsSkeleton />;

  return <SettingsTabs profile={data.profile} />;
}
