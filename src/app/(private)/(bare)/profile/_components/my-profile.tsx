"use client";

import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBondCounts, useMyProfile } from "@/services";
import { ProfileHeroCard } from "./cards/profile-hero-card";
import { ProfileHeroCardSkeleton } from "./cards/profile-hero-card-skeleton";
import { AccountDetailsCard } from "./shared/account-details-card";
import { AboutCard } from "./shared/about-card";
import { LinksCard } from "./shared/links-card";
import { LocationCard } from "./shared/location-card";
import { ProfileDetailsGridSkeleton } from "./shared/profile-details-grid-skeleton";
import { SecurityCard } from "./shared/security-card";
import { SkillsCard } from "./shared/skills-card";
import { VisibilityCard } from "./shared/visibility-card";

function VisibilityCardSkeleton() {
  return (
    <Card aria-hidden className="rounded-2xl">
      <CardHeader className="flex-row items-start gap-3">
        <Skeleton className="size-9 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
            <Skeleton className="h-[18.4px] w-8 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MyProfileView() {
  const t = useTranslations("Profile");
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const { data: bondCounts } = useMyBondCounts();

  if (isPending) {
    return (
      <div className="space-y-6">
        <ProfileHeroCardSkeleton />
        <VisibilityCardSkeleton />
        <ProfileDetailsGridSkeleton />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <EmptyState
        icon={<WifiOff className="size-5" aria-hidden />}
        title={t("empty.errorTitle")}
        description={t("empty.errorDescription")}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            {t("empty.retry")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeroCard
        profile={profile}
        activeBonds={bondCounts?.active ?? 0}
        completedBonds={bondCounts?.completed ?? 0}
      />

      <VisibilityCard profile={profile} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <AccountDetailsCard profile={profile} />
          <LocationCard profile={profile} />
        </div>

        <div className="space-y-4 lg:col-span-3">
          <AboutCard profile={profile} />
          <SkillsCard profile={profile} />
          <SecurityCard />
          <LinksCard profile={profile} />
        </div>
      </div>
    </div>
  );
}
