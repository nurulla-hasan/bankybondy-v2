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
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-44 rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-lg" />
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
