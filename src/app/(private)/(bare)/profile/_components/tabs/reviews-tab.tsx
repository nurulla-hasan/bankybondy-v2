"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RelativeTime } from "@/components/common/relative-time";
import { TabsContent } from "@/components/ui/tabs";
import { BondValue } from "@/components/common/bond-value";
import { getInitials, cn } from "@/lib/utils";
import type { RawPublicRating, RawReputation } from "@/types";

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < Math.round(rating)
              ? "fill-current text-amber-accent"
              : "text-muted-foreground/40",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

function ReviewRow({ rating }: { rating: RawPublicRating }) {
  const t = useTranslations("Profile");
  const rater = rating.ratedBy;

  return (
    <article className="space-y-3 rounded-2xl bg-card p-4 text-sm ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarImage src={rater?.profile_image} alt={rater?.name ?? ""} />
            <AvatarFallback>{getInitials(rater?.name ?? "")}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            {rater ? (
              <Link
                href={`/people/${rater._id}`}
                className="block truncate font-medium hover:underline"
              >
                {rater.name || t("reviews.anonymous")}
              </Link>
            ) : (
              <p className="truncate font-medium">{t("reviews.anonymous")}</p>
            )}

            <div aria-label={t("reviews.rating", { rating: rating.rating })}>
              <RatingStars rating={rating.rating} />
            </div>
          </div>
        </div>

        <RelativeTime
          date={rating.createdAt}
          className="shrink-0 text-xs text-muted-foreground"
        />
      </div>

      {rating.comment ? (
        <p className="leading-6 text-muted-foreground">{rating.comment}</p>
      ) : null}

      {rating.offer || rating.want ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {rating.offer ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-medium text-foreground">
                {t("reviews.offer")}:
              </span>
              <BondValue value={rating.offer} />
            </span>
          ) : null}
          {rating.want ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-medium text-foreground">
                {t("reviews.want")}:
              </span>
              <BondValue value={rating.want} />
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ReviewsTab({
  reviews,
  reputation,
}: {
  reviews: RawPublicRating[];
  reputation?: RawReputation;
}) {
  const t = useTranslations("Profile");

  return (
    <TabsContent value="reviews" className="space-y-4">
      {(reputation?.count ?? 0) > 0 ? (
        <div className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
          <span className="font-heading text-3xl font-semibold tabular-nums">
            {(reputation?.avg ?? 0).toFixed(1)}
          </span>
          <div className="space-y-1.5">
            <RatingStars rating={reputation?.avg ?? 0} />
            <p className="text-xs text-muted-foreground">
              {t("reviews.count", { count: reputation?.count ?? 0 })}
            </p>
          </div>
        </div>
      ) : null}

      {reviews.length ? (
        <div className="space-y-3">
          {reviews.map((rating) => (
            <ReviewRow key={rating._id} rating={rating} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">
          {t("reviews.empty")}
        </p>
      )}
    </TabsContent>
  );
}
