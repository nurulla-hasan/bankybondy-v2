"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { ConsumerLinks } from "./consumer-links";

export function WithdrawalNotice({ className }: { className?: string }) {
  const t = useTranslations("Legal");

  return (
    <div
      className={cn(
        "space-y-1.5 text-center text-sm leading-6 text-muted-foreground",
        className
      )}
    >
      <p>{t("consumidor.avisoCheckout")}</p>
      <ConsumerLinks />
    </div>
  );
}
