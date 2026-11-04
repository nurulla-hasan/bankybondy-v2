"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { RawBondRequestStatus } from "@/types";

const STATUS_DISPLAY = {
  WAITING_FOR_LINK: { variant: "pending", key: "waiting" },
  ONGOING: { variant: "active", key: "ongoing" },
  COMPLETED: { variant: "completed", key: "completed" },
  CANCELED: { variant: "rejected", key: "cancelled" },
} as const;

export function BondStatusBadge({
  status,
  isPause,
}: {
  status: RawBondRequestStatus;
  isPause?: boolean;
}) {
  const t = useTranslations("Bonds");

  if (isPause) {
    return <Badge variant="warning">{t("status.paused")}</Badge>;
  }

  const display = STATUS_DISPLAY[status];

  return (
    <Badge variant={display.variant}>{t(`status.${display.key}`)}</Badge>
  );
}
