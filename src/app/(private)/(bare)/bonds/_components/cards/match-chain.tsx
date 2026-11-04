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

      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <dt className="shrink-0 text-muted-foreground">{t("gives")}</dt>
          <dd className="min-w-0 text-right font-medium text-foreground">
            <BondValue value={participant.offer} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="shrink-0 text-muted-foreground">{t("wants")}</dt>
          <dd className="min-w-0 text-right font-medium text-foreground">
            <BondValue value={participant.want} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ChainConnector() {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <ArrowDown className="size-4 text-muted-foreground/60 lg:hidden" />
      <ArrowRight className="hidden size-4 text-muted-foreground/60 lg:block" />
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
            {index > 0 && <ChainConnector />}
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
