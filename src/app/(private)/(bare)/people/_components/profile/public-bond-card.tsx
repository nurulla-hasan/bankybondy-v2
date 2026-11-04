"use client";

import { useTranslations } from "next-intl";

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

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant={status.variant}>
          {t(`bondStatus.${status.key}`)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {t(`modality.${modality}`)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {t("profile.offer")}
          </span>
          <p className="font-medium">{bond.offer}</p>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {t("profile.want")}
          </span>
          <p className="font-medium">{bond.want}</p>
        </div>
      </div>

      {bond.description ? (
        <p className="line-clamp-2 leading-6 text-muted-foreground">
          {bond.description}
        </p>
      ) : null}

      <div className="mt-auto text-xs text-muted-foreground">
        <RelativeTime date={bond.createdAt} />
      </div>
    </article>
  );
}
