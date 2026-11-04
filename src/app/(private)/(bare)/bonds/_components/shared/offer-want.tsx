"use client";

import { ArrowDownUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { BondValue } from "@/components/common/bond-value";
import { cn } from "@/lib/utils";

function ExchangeRow({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: string;
  tone: "give" | "want";
  className?: string;
}) {
  const isGive = tone === "give";

  return (
    <div className={cn("min-w-0 px-3.5 py-3", className)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase">
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            isGive ? "bg-emerald-accent" : "bg-primary",
          )}
        />
        <span className={isGive ? "text-emerald-accent" : "text-primary"}>
          {label}
        </span>
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        <BondValue value={value} />
      </p>
    </div>
  );
}

export function OfferWant({
  offer,
  want,
  className,
}: {
  offer: string;
  want: string;
  className?: string;
}) {
  const t = useTranslations("Bonds");

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-muted/20",
        className,
      )}
    >
      <ExchangeRow label={t("give")} value={offer} tone="give" />

      <div className="flex items-center gap-2 px-3.5" aria-hidden>
        <span className="h-px flex-1 bg-border/70" />
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
          <ArrowDownUp className="size-3" />
        </span>
        <span className="h-px flex-1 bg-border/70" />
      </div>

      <ExchangeRow label={t("want")} value={want} tone="want" />
    </div>
  );
}
