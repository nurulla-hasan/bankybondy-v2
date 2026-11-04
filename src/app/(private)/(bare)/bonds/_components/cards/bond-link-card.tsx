"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/common/relative-time";
import { successToast } from "@/lib/toast";
import { getInitials } from "@/lib/utils";
import type { RawBondLink } from "@/types";

const STATUS_DISPLAY = {
  Ongoing: { variant: "active", key: "ongoing" },
  Completed: { variant: "completed", key: "completed" },
  Canceled: { variant: "rejected", key: "cancelled" },
} as const;

export function BondLinkCard({ link }: { link: RawBondLink }) {
  const t = useTranslations("Bonds");
  const isOngoing = link.status === "Ongoing";
  const isCancelled = link.status === "Canceled";

  const uniqueUsers = new Map<string, { id: string; name: string }>();
  for (const bond of link.requestedBonds ?? []) {
    const user = bond.user;
    if (user && typeof user === "object") {
      uniqueUsers.set(user._id, { id: user._id, name: user.name ?? "" });
    }
  }

  // The create response is not populated; fall back to raw participant ids.
  const participants = uniqueUsers.size
    ? [...uniqueUsers.values()]
    : (link.participants ?? []).map((id) => ({ id, name: "" }));

  const status = STATUS_DISPLAY[link.status];

  const handleOpenChat = () => {
    successToast(t("mockChatTitle"), t("mockChat", { name: link.name }));
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/30">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-sm font-medium">
            {link.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("membersCount", { count: participants.length })}
            <span aria-hidden> · </span>
            {t("started")} <RelativeTime date={link.createdAt} />
          </p>
        </div>

        <Badge variant={status.variant}>{t(`linkStatus.${status.key}`)}</Badge>
      </header>

      <AvatarGroup>
        {participants.map((participant) => (
          <Avatar key={participant.id} size="sm" title={participant.name}>
            <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <span className="text-xs text-muted-foreground">
          {isOngoing
            ? t("linkOngoingHint")
            : isCancelled
              ? t("linkCancelledHint")
              : t("linkCompletedHint")}
        </span>

        {isOngoing ? (
          <Button variant="outline" onClick={handleOpenChat}>
            <MessageCircle className="size-4" aria-hidden />
            {t("openChat")}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
