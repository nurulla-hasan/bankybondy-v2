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
  // Rating is a two-step action: pick a value (hover previews it), then send.
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  // Covers the gap between a successful send and the detail refetch, so the
  // picker does not flash back before `myRating` arrives.
  const [submittedRating, setSubmittedRating] = useState<number | null>(null);
  const myRating = audio.myRating ?? submittedRating;

  if (!enabled) return null;

  const feelingTags = feelingTagsQuery.data ?? [];
  const hasFeeling = selectedTags.length > 0;
  const canSubmit = text.trim().length > 0 || hasFeeling;
  const previewRating = hoveredRating ?? selectedRating ?? 0;

  const handleRate = () => {
    if (!selectedRating) return;

    giveRating.mutate(selectedRating, {
      onSuccess: () => {
        setSubmittedRating(selectedRating);
        setSelectedRating(null);
        setHoveredRating(null);
        successToast(t("detailRatingThanks"));
      },
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
        onSuccess: () => {
          // The list above already shows the saved text and feelings; leaving
          // them in the composer made the save look like it had not happened.
          setText("");
          setSelectedTags([]);
          successToast(t("detailCommentSaved"));
        },
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

            {myRating ? (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-1" aria-hidden>
                  {RATING_VALUES.map((value) => (
                    <Star
                      key={value}
                      className={cn(
                        "size-6",
                        value <= myRating
                          ? "fill-tone-amber text-tone-amber"
                          : "text-muted-foreground/40",
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm">
                  {t("detailYourRating", { value: myRating })}
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div
                  role="radiogroup"
                  aria-label={t("detailRatingLabel")}
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoveredRating(null)}
                >
                  {RATING_VALUES.map((value) => {
                    const active = value <= previewRating;

                    return (
                      <Button
                        key={value}
                        variant="ghost"
                        size="icon-lg"
                        role="radio"
                        aria-checked={selectedRating === value}
                        aria-label={t("detailRateStar", { value })}
                        disabled={giveRating.isPending}
                        onMouseEnter={() => setHoveredRating(value)}
                        onFocus={() => setHoveredRating(value)}
                        onBlur={() => setHoveredRating(null)}
                        onClick={() => setSelectedRating(value)}
                      >
                        <Star
                          aria-hidden
                          className={cn(
                            "size-7 transition-colors",
                            active
                              ? "fill-tone-amber text-tone-amber"
                              : "text-muted-foreground/40",
                          )}
                        />
                      </Button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedRating
                      ? t("detailRatingSelected", { value: selectedRating })
                      : t("detailRatingHint")}
                  </span>
                  <Button
                    disabled={!selectedRating || giveRating.isPending}
                    onClick={handleRate}
                  >
                    {giveRating.isPending ? (
                      <Loader2 className="animate-spin" aria-hidden />
                    ) : null}
                    {t("detailRatingSubmit")}
                  </Button>
                </div>
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
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  {t("detailFeelingsTop")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {audio.topFeelings.map((feeling) => (
                    <Badge key={feeling.tag} variant="secondary" size="sm">
                      {feeling.tag} · {feeling.count}
                    </Badge>
                  ))}
                </div>
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
