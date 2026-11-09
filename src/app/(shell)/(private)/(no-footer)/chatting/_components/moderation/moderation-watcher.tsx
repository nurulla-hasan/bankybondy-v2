"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { isNotFoundError } from "@/lib/error";
import { errorToast, infoToast, successToast } from "@/lib/toast";
import { useAudioModerationStatus } from "@/services/hooks/audio.hook";

import {
  markPendingAudioRetryNotified,
  setPendingAudioStatus,
  untrackPendingAudio,
  usePendingAudio,
  type PendingAudio,
} from "../shared/moderation-tracker";

/**
 * Renders nothing; polls every upload whose moderation outlived the dialog.
 * Mounted once per chatting page, so the outcome arrives even after a reload.
 */
export function AudioModerationWatcher() {
  const pending = usePendingAudio();

  return (
    <>
      {pending.map((entry) => (
        <AudioModerationWatch key={entry.id} entry={entry} />
      ))}
    </>
  );
}

function AudioModerationWatch({ entry }: { entry: PendingAudio }) {
  const t = useTranslations("Chatting");
  const audioId = entry.id;
  const moderation = useAudioModerationStatus(audioId);
  const notifiedRef = useRef<string | null>(null);

  const status = moderation.data?.moderationStatus;
  const reason = moderation.data?.moderationReason;

  useEffect(() => {
    if (!status) return;

    // Keep the feed banner honest: a technical `failed` is not "under review".
    if (status !== "ready" && status !== "rejected") {
      setPendingAudioStatus(audioId, status);
    }

    if (notifiedRef.current === status) return;

    if (status === "ready") {
      notifiedRef.current = status;
      successToast(t("shareReady"));
      untrackPendingAudio(audioId);
      return;
    }

    if (status === "rejected") {
      notifiedRef.current = status;
      errorToast(t("shareRejected"), reason || t("shareRejectedGeneric"));
      untrackPendingAudio(audioId);
      return;
    }

    if (status === "failed") {
      // Technical failure: the sweep retries it. Inform once per upload —
      // the entry outlives the tab in localStorage, and every retry lands
      // back on `failed`, so without the persisted flag this notice replayed
      // on each reload and on every retry cycle.
      if (entry.retryNotified) {
        notifiedRef.current = status;
        return;
      }
      notifiedRef.current = status;
      infoToast(t("shareRetrying"), reason || t("shareRetryingDescription"));
      markPendingAudioRetryNotified(audioId);
    }
  }, [status, reason, audioId, t, entry.retryNotified]);

  // The upload was deleted (or belongs to another account): stop tracking it.
  useEffect(() => {
    if (moderation.isError && isNotFoundError(moderation.error)) {
      untrackPendingAudio(audioId);
    }
  }, [moderation.isError, moderation.error, audioId]);

  return null;
}
