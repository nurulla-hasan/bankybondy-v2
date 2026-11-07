"use client";

import Link from "next/link";
import { ShieldCheck, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { useMyProfile } from "@/services";

import { EditProfileForm } from "./forms/edit-profile-form";
import { EditProfileFormSkeleton } from "./forms/edit-profile-form-skeleton";

export function MySettings() {
  const t = useTranslations("Profile");
  const { data: profile, isPending, isError, refetch } = useMyProfile();

  if (isPending) return <EditProfileFormSkeleton />;

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
    <div className="space-y-4">
      <EditProfileForm profile={profile} />

      <p className="text-xs leading-5 text-muted-foreground">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
        >
          <ShieldCheck className="size-3.5" aria-hidden />
          {t("settings.securityHint")}
        </Link>
      </p>
    </div>
  );
}
