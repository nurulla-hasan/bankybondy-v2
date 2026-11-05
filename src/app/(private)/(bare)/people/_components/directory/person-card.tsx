"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import type { RawPerson } from "@/types";

import { FriendStatusBadge } from "../shared/friend-status-badge";

// Skill row must stay on a single line, so the cut-off is label width rather
// than count: short skills fit three, long ones fit one.
const SKILL_ROW_MAX_CHARS = 40;

function pickVisibleSkills(skills: string[]) {
  const visible: string[] = [];
  let used = 0;

  for (const skill of skills) {
    const next = used + (visible.length ? 1 : 0) + skill.length;
    if (next > SKILL_ROW_MAX_CHARS) break;
    visible.push(skill);
    used = next;
  }

  if (!visible.length && skills.length) visible.push(skills[0]);

  return visible;
}

export function PersonCard({ person }: { person: RawPerson }) {
  const t = useTranslations("People");
  const skills = (person.skills ?? [])
    .map((skill) => skill.name)
    .filter(Boolean);
  const visibleSkills = pickVisibleSkills(skills);
  const hiddenSkills = skills.length - visibleSkills.length;

  return (
    <Link
      href={`/people/${person._id}`}
      className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="relative h-full gap-0 rounded-2xl py-0 shadow-md ring-border ease-out hover:scale-101 transition duration-300 hover:shadow-primary/15 hover:ring-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
        />

        <div className="relative h-28 w-full overflow-hidden">
          {person.cover_image ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover/card:scale-105 motion-reduce:transform-none"
              style={{ backgroundImage: `url("${person.cover_image}")` }}
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 flex items-center justify-end bg-linear-to-r from-primary/20 via-secondary to-muted"
            >
              <span className="translate-x-3 text-6xl leading-none font-bold text-primary/25 select-none">
                {getInitials(person.name)}
              </span>
            </div>
          )}

          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-card via-card/40 to-transparent"
          />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-card/85 px-2 py-1 text-xs ring-1 ring-border backdrop-blur-sm">
              <Star
                className="size-3.5 fill-current text-amber-accent"
                aria-hidden
              />
              <span className="font-semibold text-card-foreground tabular-nums">
                {(person.reputation?.avg ?? 0).toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                {t("card.reviews", { count: person.reputation?.count ?? 0 })}
              </span>
            </span>

            <FriendStatusBadge status={person.friendRequestStatus} />
          </div>
        </div>

        <div className="relative -mt-10 flex items-end gap-3 px-4">
          <Avatar
            size="xl"
            className="shrink-0 ring-2 ring-card shadow-md shadow-black/20"
          >
            <AvatarImage src={person.profile_image} alt={person.name} />
            <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pb-1">
            <h3 className="truncate font-heading text-base font-medium text-card-foreground">
              {person.name}
            </h3>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              {person.address ? (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{person.address}</span>
                </span>
              ) : null}

              {typeof person.distanceKm === "number" ? (
                <span className="inline-flex items-center gap-2 tabular-nums">
                  {person.address ? (
                    <span aria-hidden className="text-border">
                      |
                    </span>
                  ) : null}
                  {t("card.distance", { km: person.distanceKm.toFixed(1) })}
                </span>
              ) : null}
            </div>
          </div>

          <ArrowRight
            aria-hidden
            className="mb-1.5 size-4 shrink-0 text-primary opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
          />
        </div>

        {visibleSkills.length ? (
          <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden px-4 pt-3 pb-4">
            {visibleSkills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
            {hiddenSkills > 0 ? (
              <Badge variant="secondary">
                {t("card.skillsMore", { count: hiddenSkills })}
              </Badge>
            ) : null}
          </div>
        ) : (
          <div className="pb-4" aria-hidden />
        )}
      </Card>
    </Link>
  );
}
