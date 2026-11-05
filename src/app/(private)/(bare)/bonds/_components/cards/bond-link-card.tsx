"use client";

import { useState } from "react";
import { MessageCircle, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/common/relative-time";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { getInitials } from "@/lib/utils";
import { useMarkBondLinkComplete } from "@/services";
import type { RawBondLink } from "@/types";
import { RateBondLinkDialog } from "../dialogs/rate-bond-link-dialog";

const STATUS_DISPLAY = {
  Ongoing: { variant: "active", key: "ongoing" },
  Completed: { variant: "completed", key: "completed" },
  Canceled: { variant: "rejected", key: "cancelled" },
} as const;

export function BondLinkCard({ link }: { link: RawBondLink }) {
  const t = useTranslations("Bonds");
  const { user } = useAuth();
  const markComplete = useMarkBondLinkComplete();
  const [rateOpen, setRateOpen] = useState(false);

  const isOngoing = link.status === "Ongoing";
  const isCompleted = link.status === "Completed";
  const isCancelled = link.status === "Canceled";

  // markAsCompletedBy holds raw profile ids; compare as strings like the
  // backend does (bondLink.service.ts:55-57).
  const selfMarked = (link.markAsCompletedBy ?? []).some(
    (id) => String(id) === String(user?._id),
  );

  const uniqueUsers = new Map<string, { id: string; name: string }>();
  for (const bond of link.requestedBonds ?? []) {
    const owner = bond.user;
    if (owner && typeof owner === "object") {
      uniqueUsers.set(owner._id, { id: owner._id, name: owner.name ?? "" });
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

  const handleMarkComplete = () => {
    markComplete.mutate(link._id, {
      onSuccess: () => {
        successToast(t("completeSuccessTitle"), t("completeSuccess"));
        setRateOpen(true);
      },
      onError: (error) =>
        errorToast(t("completeFailed"), getErrorMessage(error, t("completeFailed"))),
    });
  };

  const canRate = (isOngoing && selfMarked) || isCompleted;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors duration-300 hover:border-primary/30">
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

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <span className="text-xs text-muted-foreground">
          {isOngoing && selfMarked
            ? t("markedByYou")
            : isOngoing
              ? t("linkOngoingHint")
              : isCancelled
                ? t("linkCancelledHint")
                : t("linkCompletedHint")}
        </span>

        <div className="flex shrink-0 gap-2">
          {isOngoing && !selfMarked ? (
            <>
              <Button variant="outline" onClick={handleOpenChat}>
                <MessageCircle className="size-4" aria-hidden />
                {t("openChat")}
              </Button>
              <Button
                onClick={handleMarkComplete}
                loading={markComplete.isPending}
                loadingText={t("completing")}
              >
                {t("markComplete")}
              </Button>
            </>
          ) : canRate ? (
            <Button variant="outline" onClick={() => setRateOpen(true)}>
              <Star className="size-4" aria-hidden />
              {t("rate")}
            </Button>
          ) : null}
        </div>
      </div>

      {rateOpen ? (
        <RateBondLinkDialog
          link={link}
          open={rateOpen}
          onOpenChange={setRateOpen}
        />
      ) : null}
    </article>
  );
}
