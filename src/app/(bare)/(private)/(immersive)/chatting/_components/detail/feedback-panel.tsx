"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  useFeelingTags,
  useGiveAudioRating,
  useSaveAudioFeedback,
} from "@/services/hooks/audio.hook";
import type { RawAudioDetail } from "@/types";

const RATING_VALUES = [1, 2, 3, 4, 5] as const;
const COMMENT_MAX_LENGTH = 500;

interface FeedbackPanelProps {
  audio: RawAudioDetail;
  isOwner: boolean;
  enabled: boolean;
}

export function FeedbackPanel({ audio, isOwner, enabled }: FeedbackPanelProps) {
  const t = useTranslations("Chatting");
  const format = useFormatter();

  const feelingTagsQuery = useFeelingTags();
  const giveRating = useGiveAudioRating(audio._id);
  const saveFeedback = useSaveAudioFeedback(audio._id);

  const [text, setText] = useState(audio.myFeeling?.text ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    audio.myFeeling?.feelingTags ?? [],
  );

  if (!enabled) return null;

  const feelingTags = feelingTagsQuery.data ?? [];
  const hasFeeling = selectedTags.length > 0;
  const canSubmit = text.trim().length > 0 || hasFeeling;

  const handleRate = (value: number) => {
    giveRating.mutate(value, {
      onSuccess: () => successToast(t("detailRatingThanks")),
      onError: (error) =>
        errorToast(
          t("detailRatingFailed"),
          getErrorMessage(error, t("detailRatingFailedDescription")),
        ),
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      errorToast(t("detailCommentRequired"));
      return;
    }

    saveFeedback.mutate(
      {
        input: {
          text: text.trim() || undefined,
          feelingTags: selectedTags,
        },
      },
      {
        onSuccess: () => successToast(t("detailCommentSaved")),
        onError: (error) =>
          errorToast(
            t("detailCommentFailed"),
            getErrorMessage(error, t("detailCommentFailedDescription")),
          ),
      },
    );
  };

  return (
    <aside className="space-y-6">
      {isOwner ? (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-medium">
            {t("detailOwnerTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("detailOwnerFeedbackHint")}
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-heading text-base font-medium">
              {t("detailRatingLabel")}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="size-4" aria-hidden />
              {audio.ratingCount
                ? t("detailRatingAverage", {
                    average: format.number(audio.averageRating, {
                      maximumFractionDigits: 1,
                    }),
                    count: audio.ratingCount,
                  })
                : t("detailRatingsEmpty")}
            </p>

            {audio.myRating ? (
              <p className="mt-3 text-sm">
                {t("detailYourRating", { value: audio.myRating })}
              </p>
            ) : (
              <div
                className="mt-3 flex items-center gap-1"
                role="group"
                aria-label={t("detailRatingLabel")}
              >
                {RATING_VALUES.map((value) => {
                  const active = value <= (audio.myRating ?? 0);

                  return (
                    <Button
                      key={value}
                      variant="ghost"
                      size="icon"
                      disabled={giveRating.isPending}
                      aria-label={t("detailRateStar", { value })}
                      onClick={() => handleRate(value)}
                    >
                      <Star
                        aria-hidden
                        className={cn(
                          active && "fill-current text-primary",
                        )}
                      />
                    </Button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <h2 className="font-heading text-base font-medium">
                {t("detailFeelingsLabel")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("detailFeelingsHint")}
              </p>
            </div>

            {feelingTagsQuery.isPending ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-20 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {feelingTags.map((tag) => {
                  const active = selectedTags.includes(tag);

                  return (
                    <Button
                      key={tag}
                      variant={active ? "default" : "outline"}
                      aria-pressed={active}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  );
                })}
              </div>
            )}

            {audio.topFeelings.length ? (
              <div className="flex flex-wrap gap-1.5">
                {audio.topFeelings.map((feeling) => (
                  <Badge key={feeling.tag} variant="secondary" size="sm">
                    {feeling.tag} · {feeling.count}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <label
                htmlFor="audio-feedback"
                className="text-sm font-medium"
              >
                {t("detailCommentLabel")}
              </label>
              <Textarea
                id="audio-feedback"
                value={text}
                maxLength={COMMENT_MAX_LENGTH}
                placeholder={t("detailCommentPlaceholder")}
                onChange={(event) => setText(event.target.value)}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {t("detailCommentCounter", {
                    count: text.length,
                    max: COMMENT_MAX_LENGTH,
                  })}
                </span>
                <Button
                  disabled={!canSubmit || saveFeedback.isPending}
                  onClick={handleSubmit}
                >
                  {saveFeedback.isPending ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden />
                      {t("detailCommentSaving")}
                    </>
                  ) : (
                    t("detailCommentSave")
                  )}
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </aside>
  );
}
