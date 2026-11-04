"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { FriendStatus } from "@/types";

const STATUS_VARIANT = {
  friend: "success",
  following: "pending",
  follower: "info",
} as const;

export function FriendStatusBadge({ status }: { status?: FriendStatus }) {
  const t = useTranslations("People");

  if (!status || status === "none") return null;

  return (
    <Badge variant={STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>
  );
}
