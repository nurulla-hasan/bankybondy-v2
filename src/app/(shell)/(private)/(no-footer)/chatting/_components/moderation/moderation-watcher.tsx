"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { isNotFoundError } from "@/lib/error";
import { errorToast, infoToast, successToast } from "@/lib/toast";
import { useAudioModerationStatus } from "@/services/hooks/audio.hook";

import {
  untrackPendingAudio,
  usePendingAudio,
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
        <AudioModerationWatch key={entry.id} audioId={entry.id} />
      ))}
    </>
  );
}

function AudioModerationWatch({ audioId }: { audioId: string }) {
  const t = useTranslations("Chatting");
  const moderation = useAudioModerationStatus(audioId);
  const notifiedRef = useRef<string | null>(null);

  const status = moderation.data?.moderationStatus;
  const reason = moderation.data?.moderationReason;

  useEffect(() => {
    if (!status || notifiedRef.current === status) return;

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
      // Technical failure: the sweep retries it. Inform once and keep the slow
      // poll running; a later ready/rejected still surfaces the final result.
      notifiedRef.current = status;
      infoToast(t("shareRetrying"), reason || t("shareRetryingDescription"));
    }
  }, [status, reason, audioId, t]);

  // The upload was deleted (or belongs to another account): stop tracking it.
  useEffect(() => {
    if (moderation.isError && isNotFoundError(moderation.error)) {
      untrackPendingAudio(audioId);
    }
  }, [moderation.isError, moderation.error, audioId]);

  return null;
}
