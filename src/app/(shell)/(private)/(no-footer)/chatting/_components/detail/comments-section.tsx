"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { RelativeTime } from "@/components/common/relative-time";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudioFeedback } from "@/services/hooks/audio.hook";
import { getInitials } from "@/lib/utils";

import { compactNumber } from "../shared/format";

const INITIAL_COMMENTS = 10;
const COMMENT_STEP = 20;
const MAX_COMMENTS = 500;

interface CommentsSectionProps {
  audioId: string;
  enabled: boolean;
}

export function CommentsSection({ audioId, enabled }: CommentsSectionProps) {
  const t = useTranslations("Chatting");
  const [limit, setLimit] = useState(INITIAL_COMMENTS);
  const feedbackQuery = useAudioFeedback(audioId, limit, enabled);

  if (!enabled) return null;

  const comments = feedbackQuery.data?.result ?? [];
  const totalComments = feedbackQuery.data?.totalComments ?? 0;
  const hasMore = comments.length < totalComments && limit < MAX_COMMENTS;

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-base font-medium">
          {t("detailCommentsTitle")}
        </h2>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MessageCircle className="size-3.5" aria-hidden />
          {compactNumber(totalComments)}
        </span>
      </header>

      {feedbackQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {t("detailCommentsEmpty")}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const authorName =
              comment.commentor?.name ?? t("detailUnknownAuthor");

            return (
              <article
                key={comment._id}
                className="flex gap-3 rounded-2xl border border-border/70 bg-background/50 p-4"
              >
                <Avatar size="sm">
                  <AvatarImage
                    src={comment.commentor?.profile_image}
                    alt={authorName}
                  />
                  <AvatarFallback>
                    {getInitials(authorName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {authorName}
                    </span>
                    {comment.createdAt ? (
                      <RelativeTime date={comment.createdAt} />
                    ) : null}
                  </div>

                  {comment.text ? (
                    <p className="text-sm leading-6">{comment.text}</p>
                  ) : null}

                  {comment.feelingTags.length ? (
                    <div className="flex flex-wrap gap-1">
                      {comment.feelingTags.map((tag) => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {hasMore ? (
        <Button
          variant="outline"
          className="w-full"
          disabled={feedbackQuery.isFetching}
          onClick={() =>
            setLimit((current) => Math.min(MAX_COMMENTS, current + COMMENT_STEP))
          }
        >
          {feedbackQuery.isFetching ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : null}
          {t("detailCommentsLoadMore")}
        </Button>
      ) : null}
    </section>
  );
}
