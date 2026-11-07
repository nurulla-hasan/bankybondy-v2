"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Modal } from "@/components/common/modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import { cn, getInitials } from "@/lib/utils";
import { useAddBondRating } from "@/services";
import { ratingSchema } from "@/validations";
import type { RawBondLink, RawBondUser } from "@/types";

interface Counterpart {
  id: string;
  name: string;
  image?: string;
}

/**
 * The people you traded with: owners of the link's requestedBonds, minus you.
 * Same set the backend accepts as `userId` (bondRating.service.ts:67-76).
 */
function useCounterparts(link: RawBondLink, selfId?: string): Counterpart[] {
  return useMemo(() => {
    const byId = new Map<string, Counterpart>();

    for (const bond of link.requestedBonds ?? []) {
      const user = bond.user as RawBondUser | string | undefined;
      if (!user || typeof user === "string") continue;
      if (selfId && String(user._id) === String(selfId)) continue;
      if (!byId.has(user._id)) {
        byId.set(user._id, {
          id: user._id,
          name: user.name ?? "",
          image: user.profile_image,
        });
      }
    }

    return [...byId.values()];
  }, [link.requestedBonds, selfId]);
}

function StarRow({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (stars: number) => void;
  disabled: boolean;
}) {
  const t = useTranslations("Bonds");

  return (
    <div
      role="radiogroup"
      aria-label={t("starsLabel")}
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((stars) => (
        <button
          key={stars}
          type="button"
          role="radio"
          aria-checked={value === stars}
          aria-label={t("starOption", { stars })}
          disabled={disabled}
          onClick={() => onChange(stars)}
          className="rounded-md p-1 transition-colors duration-200 hover:bg-accent disabled:pointer-events-none"
        >
          <Star
            className={cn(
              "size-7",
              value >= stars
                ? "fill-amber-accent text-amber-accent"
                : "text-muted-foreground/50",
            )}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}

export function RateBondLinkDialog({
  link,
  open,
  onOpenChange,
}: {
  link: RawBondLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Bonds");
  const { user } = useAuth();
  const addRating = useAddBondRating();
  const counterparts = useCounterparts(link, user?._id);

  const [targetId, setTargetId] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const target =
    counterparts.find((person) => person.id === targetId) ?? counterparts[0];

  // Ratings are an upsert server-side, so re-submitting edits the previous one;
  // the form itself resets on open and on person switch via handlers.
  const resetForm = () => {
    setStars(0);
    setComment("");
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTargetId(null);
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSelectPerson = (id: string) => {
    setTargetId(id);
    resetForm();
  };

  const handleSave = () => {
    if (!target) return;

    const parsed = ratingSchema.safeParse({
      userId: target.id,
      bondLink: link._id,
      rating: stars,
      comment: comment.trim() || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("ratingRequired"));
      return;
    }

    addRating.mutate(parsed.data, {
      onSuccess: () => {
        successToast(t("ratingSavedTitle"), t("ratingSaved", { name: target.name }));
        const remaining = counterparts.filter((person) => person.id !== target.id);
        if (remaining.length) {
          handleSelectPerson(remaining[0].id);
        } else {
          onOpenChange(false);
        }
      },
      onError: (err) => {
        setError(getErrorMessage(err, t("ratingSaveFailed")));
        errorToast(t("ratingSaveFailed"), getErrorMessage(err));
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={t("rateTitle")}
      description={t("rateDescription")}
    >
      {!counterparts.length ? (
        <p className="text-sm text-muted-foreground">{t("noCounterparts")}</p>
      ) : (
        <div className="space-y-4">
          {counterparts.length > 1 ? (
            <div className="flex flex-wrap gap-2" role="tablist">
              {counterparts.map((person) => (
                <Button
                  key={person.id}
                  type="button"
                  className="w-full sm:w-auto"
                  variant={person.id === target?.id ? "default" : "outline"}
                  onClick={() => handleSelectPerson(person.id)}
                >
                  <Avatar size="sm">
                    <AvatarImage src={person.image} alt="" />
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                  {person.name}
                </Button>
              ))}
            </div>
          ) : null}

          {target ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarImage src={target.image} alt="" />
                  <AvatarFallback>{getInitials(target.name)}</AvatarFallback>
                </Avatar>
                <p className="min-w-0 truncate text-sm font-medium">
                  {t("ratingFor", { name: target.name })}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("starsLabel")}</Label>
                <StarRow
                  value={stars}
                  onChange={setStars}
                  disabled={addRating.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bond-rating-comment">{t("commentLabel")}</Label>
                <Textarea
                  id="bond-rating-comment"
                  value={comment}
                  maxLength={500}
                  placeholder={t("commentPlaceholder")}
                  onChange={(event) => setComment(event.target.value)}
                  disabled={addRating.isPending}
                />
              </div>

              {error ? <p className="text-xs text-destructive">{error}</p> : null}

              <DialogFooter>
                <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
                  {t("ratingAppliedHint")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!stars || addRating.isPending}
                  loading={addRating.isPending}
                  loadingText={t("saving")}
                >
                  {t("saveRating")}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
