"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RawPerson } from "@/types";

import { FriendStatusBadge } from "../shared/friend-status-badge";

const MAX_VISIBLE_SKILLS = 3;

export function PersonCard({ person }: { person: RawPerson }) {
  const t = useTranslations("People");
  const skills = (person.skills ?? [])
    .map((skill) => skill.name)
    .filter(Boolean);
  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
  const hiddenSkills = skills.length - visibleSkills.length;

  return (
    <Link
      href={`/people/${person._id}`}
      className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Avatar size="lg">
              <AvatarImage src={person.profile_image} alt={person.name} />
              <AvatarFallback />
            </Avatar>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="truncate">{person.name}</CardTitle>
                <FriendStatusBadge status={person.friendRequestStatus} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {person.address ? (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{person.address}</span>
                  </span>
                ) : null}

                {typeof person.distanceKm === "number" ? (
                  <span className="tabular-nums">
                    {t("card.distance", {
                      km: person.distanceKm.toFixed(1),
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex grow flex-col gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="size-4 fill-current text-primary" aria-hidden />
            <span className="font-medium tabular-nums">
              {(person.reputation?.avg ?? 0).toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              {t("card.reviews", { count: person.reputation?.count ?? 0 })}
            </span>
          </div>

          {person.bio ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {person.bio}
            </p>
          ) : null}

          {visibleSkills.length ? (
            <div className="flex flex-wrap gap-1.5">
              {visibleSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
              {hiddenSkills > 0 ? (
                <Badge variant="outline">
                  {t("card.skillsMore", { count: hiddenSkills })}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="justify-end">
          <span className="text-sm font-medium text-primary">
            {t("card.viewProfile")}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
