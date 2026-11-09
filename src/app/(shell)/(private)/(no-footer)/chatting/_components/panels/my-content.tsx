"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  Headphones,
  Loader2,
  Pencil,
  RefreshCw,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { EmptyState } from "@/components/common/empty-state";
import { RelativeTime } from "@/components/common/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CustomPagination from "@/components/common/custom-pagination";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import {
  audioKeys,
  useAudioTopics,
  useDeleteAudio,
  useMyAudios,
} from "@/services/hooks/audio.hook";
import type { AudioModerationStatus, RawMyAudio } from "@/types";

import { EditConversationDialog } from "../dialogs/edit-conversation-dialog";
import { ShareConversationDialog } from "../dialogs/share-conversation-dialog";
import { compactNumber, formatClock } from "../shared/format";

const PAGE_SIZE = 8;

function averageRating(audio: RawMyAudio): number {
  return audio.ratingCount ? audio.totalRating / audio.ratingCount : 0;
}

interface MyContentProps {
  embedded?: boolean;
}

export function MyContent({ embedded = false }: MyContentProps) {
  const t = useTranslations("Chatting");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const topicsQuery = useAudioTopics();
  const topics = useMemo(() => topicsQuery.data ?? [], [topicsQuery.data]);

  const params = useMemo(
    () => ({ page, limit: PAGE_SIZE, sort: "-createdAt" as const }),
    [page],
  );

  const query = useMyAudios(params);
  const deleteAudio = useDeleteAudio();

  const [editTarget, setEditTarget] = useState<RawMyAudio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RawMyAudio | null>(null);

  const items = useMemo(() => query.data?.result ?? [], [query.data]);
  const meta = query.data?.meta;

  // The list polls itself while moderation is pending (see `useMyAudios`).
  // When a row flips to a final state, refresh the feed and the topic chips so
  // they reflect the new conversation without a manual reload.
  const statusesRef = useRef<Map<string, AudioModerationStatus>>(new Map());

  useEffect(() => {
    let resolved = false;

    for (const audio of items) {
      const previous = statusesRef.current.get(audio._id);
      statusesRef.current.set(audio._id, audio.moderationStatus);

      if (
        previous &&
        previous !== audio.moderationStatus &&
        (audio.moderationStatus === "ready" ||
          audio.moderationStatus === "rejected")
      ) {
        resolved = true;
      }
    }

    if (!resolved) return;

    void queryClient.invalidateQueries({ queryKey: audioKeys.topics() });
    void queryClient.invalidateQueries({ queryKey: audioKeys.lists() });
  }, [items, queryClient]);

  const handleShare = async (audio: RawMyAudio) => {
    try {
      const url = `${window.location.origin}/chatting/conversations/${audio._id}`;

      if (navigator.share) {
        await navigator.share({ title: audio.title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      successToast(t("shareCopied"));
    } catch {
      // The share sheet was dismissed; there is nothing to report.
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteAudio.mutateAsync(deleteTarget._id);
      successToast(t("myContentDeleted"));
      setDeleteTarget(null);
    } catch (error) {
      errorToast(
        t("myContentDeleteFailed"),
        getErrorMessage(error, t("myContentDeleteFailedDescription")),
      );
    }
  };

  const statusLabel = (status: AudioModerationStatus) => {
    if (status === "ready") return t("myContentStatusReady");
    if (status === "processing") return t("myContentStatusProcessing");
    if (status === "rejected") return t("myContentStatusRejected");
    return t("myContentStatusFailed");
  };

  return (
    <div className="w-full space-y-6">
      {!embedded ? (
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("myContentTitle")}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {t("myContentSubtitle")}
            </p>
          </div>
          <ShareConversationDialog topics={topics} />
        </header>
      ) : null}

      {query.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={<Headphones className="size-5" aria-hidden />}
          title={t("loadErrorTitle")}
          description={t("loadErrorDescription")}
          action={
            <Button variant="outline" onClick={() => void query.refetch()}>
              {t("loadErrorAction")}
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<AudioLines className="size-5" aria-hidden />}
          title={t("myContentEmptyTitle")}
          description={t("myContentEmptyDescription")}
        />
      ) : (
        <div className="space-y-3">
          {items.map((audio) => {
            const isProcessing = audio.moderationStatus === "processing";
            const isFailed = audio.moderationStatus === "failed";
            const showReason =
              isFailed ||
              (audio.moderationStatus === "rejected" &&
                Boolean(audio.moderationReason));

            return (
              <article
                key={audio._id}
                className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50 sm:flex-row"
              >
                <Link
                  href={`/chatting/conversations/${audio._id}`}
                  aria-label={audio.title}
                  className="absolute inset-0 z-0 rounded-2xl"
                />

                <div className="pointer-events-none relative z-10 size-24 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-primary/25 via-tone-violet/15 to-transparent">
                  {audio.cover_image ? (
                    <Image
                      src={audio.cover_image}
                      alt=""
                      fill
                      unoptimized
                      sizes="96px"
                      className="object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                </div>

                <div className="pointer-events-none relative z-10 min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        audio.moderationStatus === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {isProcessing ? (
                        <Loader2 className="size-3 animate-spin" aria-hidden />
                      ) : null}
                      {isFailed ? (
                        <RefreshCw className="size-3" aria-hidden />
                      ) : null}
                      {statusLabel(audio.moderationStatus)}
                    </Badge>
                    {audio.audioTopic ? (
                      <Badge variant="outline" size="sm">
                        {audio.audioTopic.name}
                      </Badge>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      {formatClock(audio.duration)}
                    </span>
                  </div>

                  <h2 className="line-clamp-2 font-heading text-base font-medium">
                    {audio.title}
                  </h2>

                  {showReason ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {/* The backend reason for a technical failure is a fixed
                          English string; show the localized copy instead. */}
                      {isFailed
                        ? t("shareRetryingDescription")
                        : audio.moderationReason}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {audio.createdAt ? (
                      <RelativeTime date={audio.createdAt} />
                    ) : null}
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Headphones className="size-3.5" aria-hidden />
                      {compactNumber(audio.totalPlay)}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Star className="size-3.5" aria-hidden />
                      {audio.ratingCount
                        ? averageRating(audio).toFixed(1)
                        : t("myContentNoRating")}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex shrink-0 items-center gap-1 self-start">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("myContentEdit")}
                    onClick={() => setEditTarget(audio)}
                  >
                    <Pencil aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("myContentShare")}
                    onClick={() => void handleShare(audio)}
                  >
                    <Share2 aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    aria-label={t("myContentDelete")}
                    onClick={() => setDeleteTarget(audio)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <CustomPagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          updatePage={setPage}
        />
      ) : null}

      {editTarget ? (
        <EditConversationDialog
          key={editTarget._id}
          audio={editTarget}
          topics={topics}
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
        />
      ) : null}

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("myContentDeleteTitle")}
        description={t("myContentDeletePrompt", {
          title: deleteTarget?.title ?? "",
        })}
        confirmText={t("myContentDeleteConfirm")}
        cancelText={t("myContentDeleteCancel")}
        loadingText={t("myContentDeleting")}
        variant="destructive"
        isLoading={deleteAudio.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
