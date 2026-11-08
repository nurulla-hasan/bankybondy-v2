"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

const variantStyles = {
  footer: "text-sm font-semibold text-foreground",
  inline: "text-sm font-medium text-primary hover:text-primary/80",
} as const;

interface ConsumerLinksProps {
  variant?: keyof typeof variantStyles;
  className?: string;
}

export function ConsumerLinks({ variant = "inline", className }: ConsumerLinksProps) {
  const t = useTranslations("Legal");
  const link = cn("underline underline-offset-4", variantStyles[variant]);

  return (
    <nav
      aria-label={t("consumidor.navLabel")}
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1",
        className
      )}
    >
      <Link href="/arrepentimiento" className={link}>
        {t("consumidor.linkArrepentimiento")}
      </Link>
      <Link href="/baja-de-servicio" className={link}>
        {t("consumidor.linkBaja")}
      </Link>
    </nav>
  );
}
