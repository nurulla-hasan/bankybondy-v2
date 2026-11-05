"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHeroCard } from "./cards/profile-hero-card";
import { ProfileHeroCardSkeleton } from "./cards/profile-hero-card-skeleton";
import { VisibilityCard } from "./shared/visibility-card";
import { ProfileTabs } from "./tabs/profile-tabs";
import { useMockMyProfile } from "./use-mock-my-profile";

const ACTIVE_STATUSES = new Set(["ONGOING", "WAITING_FOR_LINK"]);

function VisibilityCardSkeleton() {
  return (
    <section
      aria-hidden
      className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>

      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-[18.4px] w-8 rounded-full" />
        </div>
      ))}
    </section>
  );
}

export function MyProfileView() {
  const { data, isPending, patchProfile } = useMockMyProfile();

  if (isPending || !data) {
    return (
      <div className="space-y-6">
        <ProfileHeroCardSkeleton />
        <VisibilityCardSkeleton />
      </div>
    );
  }

  const { profile, bonds, reviews } = data;
  const activeBonds = bonds.filter((bond) =>
    ACTIVE_STATUSES.has(bond.status),
  ).length;

  return (
    <div className="space-y-6">
      <ProfileHeroCard
        profile={profile}
        activeBonds={activeBonds}
        completedBonds={bonds.filter((bond) => bond.status === "COMPLETED").length}
      />

      <VisibilityCard profile={profile} onPatch={patchProfile} />

      <ProfileTabs profile={profile} bonds={bonds} reviews={reviews} />
    </div>
  );
}
