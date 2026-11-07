"use client";

import Link from "next/link";
import { Lock, UserX, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { PageWrapper } from "@/components/common/page-wrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { isNotFoundError, isProfileHiddenError } from "@/lib/error";
import { usePerson, usePersonRatings } from "@/services";

import { PersonBonds } from "./person-bonds";
import { PersonReviews } from "./person-reviews";
import { ProfileActions } from "./profile-actions";
import { ProfileHeader } from "./profile-header";

export function PersonProfile({ id }: { id: string }) {
  const t = useTranslations("People");
  const { user } = useAuth();
  const { data: profile, isPending, isError, error, refetch } = usePerson(id);
  const { data: ratings } = usePersonRatings(id, { page: 1, limit: 1 });

  const isSelf = Boolean(user?._id && user._id === id);

  if (isPending) {
    return (
      <PageWrapper className="space-y-6">
        <div aria-hidden className="animate-pulse space-y-6">
          <section className="overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10">
            <Skeleton className="h-28 rounded-none sm:h-36" />
            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-end gap-4">
                <div className="-mt-10 shrink-0 rounded-full border-4 border-card bg-card">
                  <Skeleton className="size-20 rounded-full" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
              <div className="grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-5 w-4/5 rounded-full" />
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-56 rounded-lg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (isError || !profile) {
    const hidden = isProfileHiddenError(error);
    const notFound = isNotFoundError(error);

    return (
      <PageWrapper className="space-y-6">
        <EmptyState
          icon={
            hidden ? (
              <Lock className="size-5" aria-hidden />
            ) : notFound ? (
              <UserX className="size-5" aria-hidden />
            ) : (
              <WifiOff className="size-5" aria-hidden />
            )
          }
          title={
            hidden
              ? t("empty.hiddenTitle")
              : notFound
                ? t("empty.notFoundTitle")
                : t("empty.errorTitle")
          }
          description={
            hidden
              ? t("empty.hiddenDescription")
              : notFound
                ? t("empty.notFoundDescription")
                : t("empty.errorDescription")
          }
          action={
            hidden || notFound ? (
              <Button render={<Link href="/people" />}>
                {t("empty.backToPeople")}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => refetch()}>
                {t("empty.retry")}
              </Button>
            )
          }
        />
      </PageWrapper>
    );
  }

  const reputation = ratings?.reputation ?? profile.reputation;

  return (
    <PageWrapper className="space-y-6">
      <ProfileHeader
        profile={profile}
        reputation={reputation}
        isSelf={isSelf}
        actions={isSelf ? undefined : <ProfileActions profile={profile} />}
      />

      <PersonBonds personId={profile._id} />
      <PersonReviews personId={profile._id} />
    </PageWrapper>
  );
}
