"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { BondStatus } from "@/types";

const STATUS_VARIANT = {
  waiting: "pending",
  matched: "info",
  ongoing: "active",
  completed: "completed",
  paused: "warning",
  cancelled: "rejected",
} as const;

export function BondStatusBadge({ status }: { status: BondStatus }) {
  const t = useTranslations("Bonds");

  return <Badge variant={STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>;
}
