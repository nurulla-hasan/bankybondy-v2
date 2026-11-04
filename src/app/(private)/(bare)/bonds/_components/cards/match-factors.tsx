"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { MatchFactors as MatchFactorsData } from "@/types";

const FACTOR_ROWS = [
  { key: "semantic", bar: "bg-primary" },
  { key: "reputation", bar: "bg-amber-accent" },
  { key: "proximity", bar: "bg-emerald-accent" },
  { key: "activity", bar: "bg-violet-accent" },
] as const;

export function MatchFactors({
  factors,
  className,
}: {
  factors: MatchFactorsData;
  className?: string;
}) {
  const t = useTranslations("Bonds");

  return (
    <dl className={cn("space-y-3", className)}>
      {FACTOR_ROWS.map(({ key, bar }) => (
        <div key={key} className="flex items-center gap-3">
          <dt className="w-18 shrink-0 text-xs text-muted-foreground">
            {t(`factors.${key}`)}
          </dt>
          <dd className="flex min-w-0 flex-1 items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", bar)}
                style={{ width: `${factors[key]}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-foreground">
              {factors[key]}%
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
