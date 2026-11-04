"use client";

import type { ReactNode } from "react";
import { MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
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
      <div className="h-32 bg-muted sm:h-40" style={coverStyle} />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar
              size="lg"
              className="-mt-16 size-20 border-4 border-card bg-card sm:-mt-20 sm:size-24"
            >
              <AvatarImage src={profile.profile_image} alt={profile.name} />
              <AvatarFallback />
            </Avatar>

            <div className="min-w-0 space-y-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-xl font-semibold sm:text-2xl">
                  {profile.name}
                </h1>
                <FriendStatusBadge status={profile.friendRequestStatus} />
                {isSelf ? (
                  <Badge variant="secondary">{t("profile.self")}</Badge>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {profile.address ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden />
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
            </div>
          </div>

          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>

        <div className="flex items-center gap-1.5 text-sm">
          <Star className="size-4 fill-current text-primary" aria-hidden />
          <span className="font-medium tabular-nums">
            {(reputation?.avg ?? 0).toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            {t("profile.reviewsCount", { count: reputation?.count ?? 0 })}
          </span>
        </div>

        {profile.bio ? (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">{t("profile.about")}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {profile.bio}
            </p>
          </div>
        ) : null}

        {skills.length ? (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">{t("profile.skills")}</h2>
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
    </section>
  );
}
