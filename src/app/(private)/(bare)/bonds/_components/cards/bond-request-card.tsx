"use client";

import { Globe, MapPin, Pause, Play, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { RelativeTime } from "@/components/common/relative-time";
import { BondStatusBadge } from "../shared/bond-status-badge";
import { OfferWant } from "../shared/offer-want";
import {
  useDeleteBondRequest,
  useToggleBondRequestPause,
} from "@/services";
import { successToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { RawBondRequest } from "@/types";

interface BondRequestCardProps {
  request: RawBondRequest;
  onFindMatch: (request: RawBondRequest) => void;
}

export function BondRequestCard({
  request,
  onFindMatch,
}: BondRequestCardProps) {
  const t = useTranslations("Bonds");
  const togglePause = useToggleBondRequestPause();
  const deleteRequest = useDeleteBondRequest();
  const isPaused = request.isPause;

  const handleTogglePause = () => {
    togglePause.mutate(request, {
      onSuccess: (updated) => {
        const paused = updated.isPause;

        successToast(
          paused ? t("pauseToastTitle") : t("resumeToastTitle"),
          paused
            ? t("pauseToast", { offer: request.offer })
            : t("resumeToast", { offer: request.offer }),
        );
      },
    });
  };

  const handleDelete = () => {
    deleteRequest.mutate(request, {
      onSuccess: () => {
        successToast(
          t("deletedToastTitle"),
          t("deletedToast", { offer: request.offer }),
        );
      },
    });
  };

  return (
    <article
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        isPaused && "border-dashed bg-muted/30",
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <BondStatusBadge status={request.status} isPause={request.isPause} />
        <RelativeTime
          date={request.createdAt}
          className="shrink-0 text-xs text-muted-foreground"
        />
      </header>

      <OfferWant offer={request.offer} want={request.want} />

      {request.description ? (
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {request.description}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
          {request.modality === "online" ? (
            <Globe className="size-3.5" aria-hidden />
          ) : (
            <MapPin className="size-3.5" aria-hidden />
          )}
          {request.modality === "online"
            ? t("onlineGlobal")
            : t("inPersonRadius", { km: request.radius ?? 0 })}
        </span>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border/70 pt-3">
        <Button className="flex-1" onClick={() => onFindMatch(request)}>
          <Search className="size-4" aria-hidden />
          {t("findMatches")}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleTogglePause}
          aria-label={isPaused ? t("resume") : t("pause")}
          title={isPaused ? t("resume") : t("pause")}
        >
          {isPaused ? (
            <Play className="size-4" aria-hidden />
          ) : (
            <Pause className="size-4" aria-hidden />
          )}
        </Button>

        <ConfirmationModal
          title={t("deleteTitle")}
          description={t("deleteDescription", { offer: request.offer })}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          variant="destructive"
          onConfirm={handleDelete}
          actionTrigger={
            <Button
              variant="outline"
              size="icon"
              aria-label={t("delete")}
              title={t("delete")}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          }
        />
      </div>
    </article>
  );
}
