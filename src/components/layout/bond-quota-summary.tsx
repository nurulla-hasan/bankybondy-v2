"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { useBondQuota } from "@/services";

/** Compact plan-quota readout for the account menus. */
export function BondQuotaSummary({ className }: { className?: string }) {
  const t = useTranslations("Bonds");
  const query = useBondQuota();

  if (query.isPending) {
    return (
      <div
        className={cn("h-11 w-full animate-pulse rounded-md bg-muted", className)}
      />
    );
  }

  if (query.isError || !query.data) return null;

  const { used, limit, remaining } = query.data;
  const full = remaining <= 0;
  const nearCap = !full && remaining <= 3;
  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex w-full items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{t("quotaLabel")}</span>
        <span className="font-medium tabular-nums">
          {t("quotaValue", { used, limit })}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={t("quotaLabel")}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            full ? "bg-destructive" : nearCap ? "bg-tone-amber" : "bg-primary",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p
        className={cn(
          "text-[11px] text-muted-foreground",
          full && "text-destructive",
        )}
      >
        {full ? t("quotaFull") : t("quotaRemaining", { count: remaining })}
      </p>
    </div>
  );
}
