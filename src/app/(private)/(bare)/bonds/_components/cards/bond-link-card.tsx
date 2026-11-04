"use client";

import { MessageCircle, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/common/relative-time";
import { successToast } from "@/lib/toast";
import { getInitials } from "@/lib/utils";
import type { BondLink } from "@/types";

const STATUS_VARIANT = {
  ongoing: "active",
  completed: "completed",
  cancelled: "rejected",
} as const;

export function BondLinkCard({ link }: { link: BondLink }) {
  const t = useTranslations("Bonds");
  const isOngoing = link.status === "ongoing";
  const isCancelled = link.status === "cancelled";

  const handleOpenChat = () => {
    successToast(t("mockChatTitle"), t("mockChat", { name: link.name }));
  };

  const handleRate = () => {
    successToast(t("mockRateTitle"), t("mockRate", { name: link.name }));
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/30">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-sm font-medium">
            {link.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("membersCount", { count: link.participants.length })}
            <span aria-hidden> · </span>
            {t("started")} <RelativeTime date={link.createdAt} />
          </p>
        </div>

        <Badge variant={STATUS_VARIANT[link.status]}>
          {t(`linkStatus.${link.status}`)}
        </Badge>
      </header>

      <AvatarGroup>
        {link.participants.map((participant) => (
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
              : link.pendingRating
                ? t("ratingPending")
                : t("linkCompletedHint")}
        </span>

        {isOngoing ? (
          <Button variant="outline" onClick={handleOpenChat}>
            <MessageCircle className="size-4" aria-hidden />
            {t("openChat")}
          </Button>
        ) : link.pendingRating ? (
          <Button onClick={handleRate}>
            <Star className="size-4" aria-hidden />
            {t("rateNow")}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
