"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { FriendStatus } from "@/types";

const STATUS_CONFIG = {
  friend: { dot: "bg-emerald-500" },
  following: { dot: "bg-orange-500" },
  follower: { dot: "bg-sky-500" },
} as const;

export function FriendStatusBadge({
  status,
  className,
}: {
  status?: FriendStatus;
  className?: string;
}) {
  const t = useTranslations("People");

  if (!status || status === "none") return null;

  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-card/85 px-2.5 py-1 text-xs font-medium text-card-foreground shadow-xs ring-1 ring-border backdrop-blur-sm",
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", config.dot)} />
      <span>{t(`status.${status}`)}</span>
    </span>
  );
}

