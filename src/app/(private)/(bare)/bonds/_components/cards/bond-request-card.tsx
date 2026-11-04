"use client";

import {
  Globe,
  MapPin,
  Pause,
  Play,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { BondStatusBadge } from "../shared/bond-status-badge";
import { OfferWant } from "../shared/offer-want";
import {
  useDeleteBondRequest,
  useToggleBondRequestPause,
} from "@/services";
import { successToast } from "@/lib/toast";
import { formatRelativeTime } from "@/lib/utils";
import type { BondRequest } from "@/types";

interface BondRequestCardProps {
  request: BondRequest;
  onFindMatch: (request: BondRequest) => void;
}

export function BondRequestCard({
  request,
  onFindMatch,
}: BondRequestCardProps) {
  const t = useTranslations("Bonds");
  const togglePause = useToggleBondRequestPause();
  const deleteRequest = useDeleteBondRequest();
  const isPaused = request.status === "paused";

  const handleTogglePause = () => {
    togglePause.mutate(request, {
      onSuccess: (updated) => {
        const paused = updated.status === "paused";

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
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition-colors duration-300 hover:border-primary/30">
      <header className="flex items-center justify-between gap-3">
        <BondStatusBadge status={request.status} />
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(request.createdAt)}
        </span>
      </header>

      <OfferWant
        offer={request.offer}
        want={request.want}
        orientation="vertical"
      />

      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
        {request.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          {request.modality === "online" ? (
            <Globe className="size-3.5" aria-hidden />
          ) : (
            <MapPin className="size-3.5" aria-hidden />
          )}
          {request.modality === "online"
            ? t("onlineGlobal")
            : t("inPersonRadius", { km: request.radiusKm ?? 0 })}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Users className="size-3.5" aria-hidden />
          {t("matchesCount", { count: request.matchCount })}
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
