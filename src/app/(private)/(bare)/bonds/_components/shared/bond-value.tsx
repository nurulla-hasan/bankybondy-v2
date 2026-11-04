"use client";

import { Gift, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export function BondValue({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const t = useTranslations("Bonds");

  if (value === "empty") {
    return (
      <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
        <Gift className="size-3.5 shrink-0 text-pink-accent" aria-hidden />
        <span className="truncate">{t("openGift")}</span>
      </span>
    );
  }

  if (value === "surprise") {
    return (
      <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
        <Sparkles className="size-3.5 shrink-0 text-violet-accent" aria-hidden />
        <span className="truncate">{t("surprise")}</span>
      </span>
    );
  }

  return <span className={cn("block truncate", className)}>{value}</span>;
}
