"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { RawBondMatch } from "@/types";

const FACTOR_ROWS = [
  { key: "semantic", source: "sem", bar: "bg-primary" },
  { key: "reputation", source: "rep", bar: "bg-amber-accent" },
  { key: "proximity", source: "prox", bar: "bg-emerald-accent" },
  { key: "activity", source: "fresh", bar: "bg-violet-accent" },
] as const;

const toPercent = (value: number) =>
  Math.round(Math.max(0, Math.min(1, value)) * 100);

export function MatchFactors({
  scoreParts,
  className,
}: {
  scoreParts: RawBondMatch["scoreParts"];
  className?: string;
}) {
  const t = useTranslations("Bonds");

  return (
    <dl className={cn("space-y-3", className)}>
      {FACTOR_ROWS.map(({ key, source, bar }) => {
        const value = toPercent(scoreParts[source]);

        return (
          <div key={key} className="flex items-center gap-3">
            <dt className="w-18 shrink-0 text-xs text-muted-foreground">
              {t(`factors.${key}`)}
            </dt>
            <dd className="flex min-w-0 flex-1 items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", bar)}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-foreground">
                {value}%
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
