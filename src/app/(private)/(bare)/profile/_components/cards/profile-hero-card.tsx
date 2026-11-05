"use client";

import Link from "next/link";
import { CalendarDays, CircleCheck, Eye, MapPin, PencilLine, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatStrip } from "@/components/common/stat-strip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { MyProfile } from "@/types";

const COMPLETENESS_FIELDS: ((profile: MyProfile) => boolean)[] = [
  (profile) => Boolean(profile.profile_image),
  (profile) => Boolean(profile.cover_image),
  (profile) => Boolean(profile.bio?.trim()),
  (profile) => Boolean(profile.phone),
  (profile) => Boolean(profile.address),
  (profile) => Boolean(profile.dateOfBirth),
  (profile) => Boolean(profile.skills?.length),
  (profile) => Boolean(profile.socialLinks?.length),
];

export function ProfileHeroCard({
  profile,
  activeBonds,
  completedBonds,
}: {
  profile: MyProfile;
  activeBonds: number;
  completedBonds: number;
}) {
  const t = useTranslations("Profile");
  const reputation = profile.reputation;
  const filled = COMPLETENESS_FIELDS.filter((test) => test(profile)).length;
  const completeness = Math.round((filled / COMPLETENESS_FIELDS.length) * 100);

  const stats = [
    { value: String(activeBonds), label: t("stat.activeBonds") },
    { value: String(completedBonds), label: t("stat.completedBonds") },
    {
      value: (reputation?.avg ?? 0).toFixed(1),
      label: t("stat.rating", { count: reputation?.count ?? 0 }),
    },
  ];

  return (
    <Card className="gap-0 rounded-2xl py-0">
      <div className="relative h-36 overflow-hidden sm:h-44">
        {profile.cover_image ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${profile.cover_image}")` }}
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/10 to-transparent"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-card via-card/35 to-transparent"
        />
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <div className="-mt-16 shrink-0 rounded-full bg-card sm:-mt-20">
              <Avatar
                size="xl"
                className="size-20 ring-4 ring-card shadow-lg shadow-black/15 sm:size-24"
              >
                <AvatarImage src={profile.profile_image} alt={profile.name} />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 space-y-2 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-heading text-xl font-semibold sm:text-2xl">
                  {profile.name}
                </h1>
                <Badge variant="secondary">{t("selfBadge")}</Badge>
                {profile.subscriptionType &&
                profile.subscriptionType !== "Free" ? (
                  <Badge variant="info">{profile.subscriptionType}</Badge>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {profile.address ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    {profile.address}
                  </span>
                ) : null}

                {profile.createdAt ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                    {t("memberSince", {
                      date: formatDate(profile.createdAt, "MMM yyyy"),
                    })}
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-1.5">
                  <Star
                    className="size-3.5 fill-current text-amber-accent"
                    aria-hidden
                  />
                  <span className="font-medium tabular-nums text-foreground">
                    {(reputation?.avg ?? 0).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    {t("reviewsCount", { count: reputation?.count ?? 0 })}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" render={<Link href={`/people/${profile._id}`} />}>
              <Eye className="size-4" aria-hidden />
              {t("viewPublic")}
            </Button>

            <Button render={<Link href="/settings" />}>
              <PencilLine className="size-4" aria-hidden />
              {t("edit")}
            </Button>
          </div>
        </div>

        <StatStrip items={stats} className="border-t border-border/70 pt-5" />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-widest uppercase">
            <span className="text-muted-foreground">{t("completeness")}</span>
            <span
              className={cn(
                "tabular-nums",
                completeness === 100 ? "text-emerald-accent" : "text-primary",
              )}
            >
              {completeness}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={completeness}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("completeness")}
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              aria-hidden
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                completeness === 100 ? "bg-emerald-accent" : "bg-primary",
              )}
              style={{ width: `${completeness}%` }}
            />
          </div>

          {completeness < 100 ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CircleCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
              {t("completenessHint")}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
