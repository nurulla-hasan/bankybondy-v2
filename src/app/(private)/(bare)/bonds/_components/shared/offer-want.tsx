"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { BondValue } from "./bond-value";

function OfferWantCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "give" | "want";
}) {
  const isGive = tone === "give";

  return (
    <div
      className={cn(
        "min-w-0 flex-1 rounded-xl px-3.5 py-2.5",
        isGive ? "bg-emerald-accent/10" : "bg-primary/10",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold tracking-widest uppercase",
          isGive ? "text-emerald-accent" : "text-primary",
        )}
      >
        {label}
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
  orientation = "horizontal",
}: {
  offer: string;
  want: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  const t = useTranslations("Bonds");

  return (
    <div
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-2"
          : "flex items-stretch gap-2.5",
        className,
      )}
    >
      <OfferWantCell label={t("give")} value={offer} tone="give" />
      {orientation === "horizontal" && (
        <div className="flex items-center" aria-hidden>
          <ArrowRight className="size-4 text-muted-foreground/60" />
        </div>
      )}
      <OfferWantCell label={t("want")} value={want} tone="want" />
    </div>
  );
}
