"use client";

import type { ReactNode } from "react";
import { MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, getInitials } from "@/lib/utils";
import type { RawPersonProfile, RawReputation } from "@/types";

import { FriendStatusBadge } from "../shared/friend-status-badge";

interface ProfileHeaderProps {
  profile: RawPersonProfile;
  reputation?: RawReputation;
  isSelf: boolean;
  actions?: ReactNode;
}

export function ProfileHeader({
  profile,
  reputation,
  isSelf,
  actions,
}: ProfileHeaderProps) {
  const t = useTranslations("People");
  const skills = (profile.skills ?? [])
    .map((skill) => skill.name)
    .filter(Boolean);
  const coverStyle = profile.cover_image
    ? {
        backgroundImage: `url("${profile.cover_image}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }
    : undefined;

  return (
    <section className="overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10">
      <div className="relative h-28 overflow-hidden sm:h-36">
        {coverStyle ? (
          <div className="absolute inset-0" style={coverStyle} aria-hidden />
        ) : (
          <div
            className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/10 to-transparent"
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-linear-to-t from-card/70 via-card/10 to-transparent"
          aria-hidden
        />
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <div className="-mt-10 shrink-0 rounded-full border-4 border-card bg-card shadow-sm">
              <Avatar size="xl">
                <AvatarImage src={profile.profile_image} alt={profile.name} />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-xl font-semibold sm:text-2xl">
                  {profile.name}
                </h1>
                <FriendStatusBadge status={profile.friendRequestStatus} />
                {isSelf ? (
                  <Badge variant="secondary">{t("profile.self")}</Badge>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {profile.address ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    {profile.address}
                  </span>
                ) : null}

                {profile.createdAt ? (
                  <span>
                    {t("profile.memberSince", {
                      date: formatDate(profile.createdAt, "MMM yyyy"),
                    })}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                  <Star
                    className="size-3.5 fill-current text-primary"
                    aria-hidden
                  />
                  <span className="font-medium tabular-nums text-foreground">
                    {(reputation?.avg ?? 0).toFixed(1)}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {t("profile.reviewsCount", {
                    count: reputation?.count ?? 0,
                  })}
                </span>
              </div>
            </div>
          </div>

          {actions ? (
            <div className="shrink-0 sm:pt-1">{actions}</div>
          ) : null}
        </div>

        {profile.bio || skills.length ? (
          <div className="grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-3">
            {profile.bio ? (
              <div className="space-y-2 sm:col-span-2">
                <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  {t("profile.about")}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {profile.bio}
                </p>
              </div>
            ) : null}

            {skills.length ? (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  {t("profile.skills")}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
