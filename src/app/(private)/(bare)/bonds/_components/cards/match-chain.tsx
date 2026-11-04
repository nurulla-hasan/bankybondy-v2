"use client";

import { Fragment } from "react";
import { ArrowDown, ArrowRight, RotateCw, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BondValue } from "@/components/common/bond-value";
import { cn } from "@/lib/utils";

export interface BondParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  reputation?: { avg: number; count: number };
  offer: string;
  want: string;
  /** Per-pair colors from the API: both ends of one exchange share a color. */
  offerColor?: string;
  wantColor?: string;
}

/**
 * Same tint recipe as the Badge custom variants: 15% fill, -700 ink on light,
 * -400 ink on dark, so pair hues stay readable in both themes.
 */
const TONES = {
  red: {
    block:
      "bg-red-500/15 text-red-700 border-red-500/20 dark:text-red-400 dark:border-red-500/30",
    dot: "bg-red-500",
  },
  green: {
    block:
      "bg-green-500/15 text-green-700 border-green-500/20 dark:text-green-400 dark:border-green-500/30",
    dot: "bg-green-500",
  },
  sky: {
    block:
      "bg-sky-500/15 text-sky-700 border-sky-500/20 dark:text-sky-400 dark:border-sky-500/30",
    dot: "bg-sky-500",
  },
  violet: {
    block:
      "bg-violet-500/15 text-violet-700 border-violet-500/20 dark:text-violet-400 dark:border-violet-500/30",
    dot: "bg-violet-500",
  },
  amber: {
    block:
      "bg-amber-500/15 text-amber-700 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
  fuchsia: {
    block:
      "bg-fuchsia-500/15 text-fuchsia-700 border-fuchsia-500/20 dark:text-fuchsia-400 dark:border-fuchsia-500/30",
    dot: "bg-fuchsia-500",
  },
  orange: {
    block:
      "bg-orange-500/15 text-orange-700 border-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
    dot: "bg-orange-500",
  },
} as const;

type Tone = keyof typeof TONES;

/** Backend palette (matching.colors.ts) mapped to the badge tone families. */
const HEX_TONES: Record<string, Tone> = {
  ea9999: "red",
  b6d7a8: "green",
  "9fc5e8": "sky",
  d5a6bd: "violet",
  ffe599: "amber",
  ff6b9d: "fuchsia",
  ff9b54: "orange",
  "8b5cf6": "violet",
};

function toneFor(color?: string): Tone | undefined {
  if (!color) return undefined;

  return HEX_TONES[color.replace("#", "").toLowerCase()];
}

function ValueBlock({ value, color }: { value: string; color?: string }) {
  const tone = toneFor(color);
  const styles = tone ? TONES[tone] : undefined;

  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 font-medium",
        styles ? styles.block : "border-border bg-muted text-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          styles ? styles.dot : "bg-muted-foreground",
        )}
        aria-hidden
      />
      <BondValue value={value} />
    </span>
  );
}

function ParticipantNode({ participant }: { participant: BondParticipant }) {
  const t = useTranslations("Bonds");
  const reputation = participant.reputation;

  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-border bg-background/70 p-4">
      <div className="flex items-center gap-3">
        <Avatar size="lg" title={participant.name}>
          {participant.avatarUrl && (
            <AvatarImage
              src={participant.avatarUrl}
              alt={participant.name}
            />
          )}
          <AvatarFallback/>
        </Avatar>
        <div className="min-w-0">
          <p
            title={participant.name}
            className="truncate text-sm font-semibold text-foreground"
          >
            {participant.name}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {reputation && reputation.count > 0 ? (
              <>
                <Star
                  className="size-3 fill-amber-accent/30 text-amber-accent"
                  aria-hidden
                />
                {reputation.avg.toFixed(1)} ({reputation.count})
              </>
            ) : (
              t("noRatings")
            )}
          </p>
        </div>
      </div>

      <dl className="mt-3 space-y-2 text-xs">
        <div className="space-y-1">
          <dt className="font-medium tracking-wide text-muted-foreground uppercase">
            {t("gives")}
          </dt>
          <dd className="min-w-0">
            <ValueBlock value={participant.offer} color={participant.offerColor} />
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium tracking-wide text-muted-foreground uppercase">
            {t("wants")}
          </dt>
          <dd className="min-w-0">
            <ValueBlock value={participant.want} color={participant.wantColor} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ChainConnector({ color }: { color?: string }) {
  const tone = toneFor(color);
  const styles = tone ? TONES[tone] : undefined;

  return (
    <div className="flex items-center justify-center" aria-hidden>
      {styles ? (
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full border",
            styles.block,
          )}
        >
          <ArrowDown className="size-3.5 lg:hidden" />
          <ArrowRight className="hidden size-3.5 lg:block" />
        </span>
      ) : (
        <>
          <ArrowDown className="size-4 text-muted-foreground/60 lg:hidden" />
          <ArrowRight className="hidden size-4 text-muted-foreground/60 lg:block" />
        </>
      )}
    </div>
  );
}

export function MatchChain({
  participants,
  className,
}: {
  participants: BondParticipant[];
  className?: string;
}) {
  const t = useTranslations("Bonds");
  const first = participants[0];

  return (
    <div className={cn(className)}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {participants.map((participant, index) => (
          <Fragment key={participant.id}>
            {index > 0 && (
              <ChainConnector
                color={
                  participants[index - 1].wantColor ?? participant.offerColor
                }
              />
            )}
            <ParticipantNode participant={participant} />
          </Fragment>
        ))}
      </div>

      {first && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          <RotateCw className="size-3.5 shrink-0" aria-hidden />
          {t("cycleNote", { name: first.name })}
        </p>
      )}
    </div>
  );
}
