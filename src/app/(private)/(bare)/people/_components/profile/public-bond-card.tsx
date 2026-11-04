"use client";

import { ArrowDownUp, Clock, Globe, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { BondValue } from "@/components/common/bond-value";
import { RelativeTime } from "@/components/common/relative-time";
import { Badge } from "@/components/ui/badge";
import type { RawPublicBond } from "@/types";

const STATUS_DISPLAY = {
  WAITING_FOR_LINK: { variant: "pending", key: "waiting" },
  ONGOING: { variant: "active", key: "ongoing" },
  COMPLETED: { variant: "completed", key: "completed" },
  CANCELED: { variant: "rejected", key: "cancelled" },
} as const;

export function PublicBondCard({ bond }: { bond: RawPublicBond }) {
  const t = useTranslations("People");
  const status = STATUS_DISPLAY[bond.status] ?? STATUS_DISPLAY.WAITING_FOR_LINK;
  const modality =
    bond.modality?.toLowerCase() === "online" ? "online" : "physical";
  const isOnline = modality === "online";

  return (
    <article className="group flex h-full flex-col gap-4 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10 transition-colors duration-300 hover:ring-primary/30">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant={status.variant}>
          {t(`bondStatus.${status.key}`)}
        </Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {isOnline ? (
            <Globe className="size-3.5" aria-hidden />
          ) : (
            <MapPin className="size-3.5" aria-hidden />
          )}
          {t(`modality.${modality}`)}
        </span>
      </header>

      <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <span
              className="size-1.5 shrink-0 rounded-full bg-emerald-accent"
              aria-hidden
            />
            {t("profile.offer")}
          </p>
          <p className="mt-1 font-medium text-foreground">
            <BondValue value={bond.offer} />
          </p>
        </div>

        <div className="flex items-center gap-2" aria-hidden>
          <span className="h-px flex-1 bg-border/70" />
          <ArrowDownUp className="size-3.5 text-muted-foreground" />
          <span className="h-px flex-1 bg-border/70" />
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
            <span
              className="size-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            {t("profile.want")}
          </p>
          <p className="mt-1 font-medium text-foreground">
            <BondValue value={bond.want} />
          </p>
        </div>
      </div>

      {bond.description ? (
        <p className="line-clamp-2 leading-6 text-muted-foreground">
          {bond.description}
        </p>
      ) : null}

      <footer className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden />
        <RelativeTime date={bond.createdAt} />
      </footer>
    </article>
  );
}
