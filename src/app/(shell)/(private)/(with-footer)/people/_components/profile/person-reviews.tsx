"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Star, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomPagination from "@/components/common/custom-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { RelativeTime } from "@/components/common/relative-time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNextFilter } from "@/hooks/useNextFilter";
import { cn } from "@/lib/utils";
import { PERSON_RATINGS_PAGE_SIZE, usePersonRatings } from "@/services";
import type { RawPublicRating } from "@/types";

type ReviewsFilterKey = "ratingsPage";

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < Math.round(rating)
              ? "fill-current text-primary"
              : "text-muted-foreground/40",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

function RatingRow({ rating }: { rating: RawPublicRating }) {
  const t = useTranslations("People");
  const rater = rating.ratedBy;

  return (
    <article className="space-y-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarImage src={rater?.profile_image} alt={rater?.name ?? ""} />
            <AvatarFallback />
          </Avatar>

          <div className="min-w-0 space-y-1">
            {rater ? (
              <Link
                href={`/people/${rater._id}`}
                className="block truncate font-medium hover:underline"
              >
                {rater.name || t("profile.anonymousRater")}
              </Link>
            ) : (
              <p className="truncate font-medium">
                {t("profile.anonymousRater")}
              </p>
            )}

            <div aria-label={t("profile.rating", { rating: rating.rating })}>
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
            <span>
              <span className="font-medium text-foreground">
                {t("profile.offer")}:
              </span>{" "}
              {rating.offer}
            </span>
          ) : null}
          {rating.want ? (
            <span>
              <span className="font-medium text-foreground">
                {t("profile.want")}:
              </span>{" "}
              {rating.want}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function PersonReviews({ personId }: { personId: string }) {
  const t = useTranslations("People");
  const { getFilter, updateBatch } = useNextFilter<ReviewsFilterKey>();

  const pageParam = Number(getFilter("ratingsPage", "1"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const { data, isPending, isError, isFetching, refetch } = usePersonRatings(
    personId,
    { page, limit: PERSON_RATINGS_PAGE_SIZE },
  );

  useEffect(() => {
    if (!data || data.meta.totalPages < 1 || page <= data.meta.totalPages) {
      return;
    }

    updateBatch(
      { ratingsPage: data.meta.totalPages <= 1 ? null : data.meta.totalPages },
      { resetPage: false },
    );
  }, [data, page, updateBatch]);

  const handlePageChange = (nextPage: number) => {
    updateBatch(
      { ratingsPage: nextPage <= 1 ? null : nextPage },
      { resetPage: false },
    );
  };

  const ratings = data?.ratings ?? [];
  const reputation = data?.reputation;

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-lg font-semibold">
        {t("profile.reviews")}
      </h2>

      {(reputation?.count ?? 0) > 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <span className="font-heading text-2xl font-semibold tabular-nums">
            {(reputation?.avg ?? 0).toFixed(1)}
          </span>
          <div className="space-y-1">
            <RatingStars rating={reputation?.avg ?? 0} />
            <p className="text-xs text-muted-foreground">
              {t("profile.reviewsCount", { count: reputation?.count ?? 0 })}
            </p>
          </div>
        </div>
      ) : null}

      {isPending ? (
        <div className="space-y-3" aria-hidden>
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<WifiOff className="size-5" aria-hidden />}
          title={t("profile.reviewsLoadErrorTitle")}
          description={t("profile.reviewsLoadErrorDescription")}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              {t("empty.retry")}
            </Button>
          }
        />
      ) : ratings.length ? (
        <div
          className={cn(
            "space-y-3",
            isFetching && "opacity-60 transition-opacity",
          )}
          aria-busy={isFetching}
        >
          {ratings.map((rating) => (
            <RatingRow key={rating._id} rating={rating} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Star className="size-5" aria-hidden />}
          title={t("profile.reviewsEmptyTitle")}
          description={t("profile.reviewsEmptyDescription")}
        />
      )}

      {data && !isError ? (
        <CustomPagination
          currentPage={data.meta.page}
          totalPages={data.meta.totalPages}
          updatePage={handlePageChange}
        />
      ) : null}
    </section>
  );
}
