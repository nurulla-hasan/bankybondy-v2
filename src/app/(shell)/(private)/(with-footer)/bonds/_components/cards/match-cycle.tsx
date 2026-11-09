"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { BondParticipant } from "./match-chain";

const NODE_RADIUS = 35;
const ARC_RADIUS = 43;
const ARC_GAP = 30;
const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function polarPoint(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: 50 + radius * Math.cos(radians),
    y: 50 + radius * Math.sin(radians),
  };
}

function arcPath(from: number, to: number, radius: number) {
  const start = polarPoint(from, radius);
  const end = polarPoint(to, radius);
  const largeArc = to - from > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function scoreColor(score: number) {
  if (score >= 90) return "var(--emerald-accent)";
  if (score >= 85) return "var(--primary)";

  return "var(--amber-accent)";
}

export function MatchCycle({
  participants,
  score,
  className,
}: {
  participants: BondParticipant[];
  score: number;
  className?: string;
}) {
  const t = useTranslations("Bonds");
  const markerId = `bond-cycle-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const step = 360 / participants.length;
  const stroke = scoreColor(score);

  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-80",
        className,
      )}
      aria-hidden
    >
      {participants.length > 1 && (
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="6"
              markerHeight="6"
              refX="5.4"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M 0 0 L 6 3 L 0 6 Z"
                fill="var(--primary)"
                fillOpacity="0.8"
              />
            </marker>
          </defs>

          {participants.map((participant, index) => {
            const from = -90 + index * step + ARC_GAP;
            const to = -90 + (index + 1) * step - ARC_GAP;

            return (
              <path
                key={participant.id}
                d={arcPath(from, to, ARC_RADIUS)}
                fill="none"
                stroke="var(--primary)"
                strokeOpacity="0.25"
                strokeWidth="1"
                strokeLinecap="round"
                markerEnd={`url(#${markerId})`}
              />
            );
          })}
        </svg>
      )}

      <div className="absolute top-1/2 left-1/2 flex size-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-card shadow-sm">
        <svg
          viewBox="0 0 96 96"
          className="absolute inset-0 size-full -rotate-90"
        >
          <circle
            cx="48"
            cy="48"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <circle
            cx="48"
            cy="48"
            r={RING_RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - score / 100)}
          />
        </svg>

        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {score}%
        </span>
        <span className="text-xs text-muted-foreground">
          {t("compatibility")}
        </span>
      </div>

      {participants.map((participant, index) => {
        const { x, y } = polarPoint(-90 + index * step, NODE_RADIUS);

        return (
          <div
            key={participant.id}
            title={participant.name}
            className="absolute flex w-18 -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <Avatar size="lg">
              {participant.avatarUrl && (
                <AvatarImage
                  src={participant.avatarUrl}
                  alt={participant.name}
                />
              )}
              <AvatarFallback />
            </Avatar>
            <span className="mt-1 w-full truncate text-center text-xs font-medium text-foreground">
              {participant.name.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
