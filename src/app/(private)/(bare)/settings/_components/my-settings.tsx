"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { useMockMyProfile } from "@/app/(private)/(bare)/profile/_components/use-mock-my-profile";

import { EditProfileForm } from "./forms/edit-profile-form";
import { EditProfileFormSkeleton } from "./forms/edit-profile-form-skeleton";

export function MySettings() {
  const t = useTranslations("Profile");
  const { data, isPending } = useMockMyProfile();

  if (isPending || !data) return <EditProfileFormSkeleton />;

  return (
    <div className="space-y-4">
      <EditProfileForm profile={data.profile} />

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
