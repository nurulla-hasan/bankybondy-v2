"use client";

import {
  Bookmark,
  Clock3,
  Headphones,
  MessageCircle,
  Pause,
  Play,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import type { FeedAudio } from "../shared/audio-model";
import { compactNumber, formatClock } from "../shared/format";
import { Waveform } from "../shared/waveform";

interface FeaturedConversationProps {
  conversation: FeedAudio;
  isPlaying: boolean;
  isSaved: boolean;
  /** 0-100, shared with the mini player. */
  progress: number;
  elapsedSec: number;
  onPlay: () => void;
  onToggleSave: () => void;
  onShare: () => void;
}

export function FeaturedConversation({
  conversation,
  isPlaying,
  isSaved,
  progress,
  elapsedSec,
  onPlay,
  onToggleSave,
  onShare,
}: FeaturedConversationProps) {
  const t = useTranslations("Chatting");
  const format = useFormatter();

  return (
    <article className="relative overflow-hidden rounded-3xl border border-border bg-card">
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-linear-to-br",
          conversation.gradient,
        )}
      />

      <div className="relative space-y-5 p-5 sm:p-7">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">
            <Sparkles aria-hidden />
            {t("featuredLabel")}
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden />
            {formatClock(conversation.durationSec)}
            <span aria-hidden>·</span>
            <Headphones className="size-3.5" aria-hidden />
            {t("cardListens", {
              count: compactNumber(conversation.totalPlay),
            })}
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {conversation.title}
            </h2>

            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {conversation.description}
            </p>

            {conversation.topFeelings.length ? (
              <div className="flex flex-wrap gap-1">
                {conversation.topFeelings.slice(0, 3).map((feeling) => (
                  <Badge key={feeling.tag} variant="outline" size="sm">
                    {feeling.tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-2.5">
              <Avatar size="lg">
                <AvatarImage
                  src={conversation.author.profileImage}
                  alt={conversation.author.name}
                />
                <AvatarFallback>
                  {getInitials(conversation.author.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {conversation.author.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {conversation.topic.name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="xl" onClick={onPlay}>
                {isPlaying ? <Pause aria-hidden /> : <Play aria-hidden />}
                {isPlaying ? t("featuredPause") : t("featuredPlay")}
              </Button>

              <Button variant="outline" size="xl" onClick={onToggleSave}>
                <Bookmark
                  aria-hidden
                  className={cn(isSaved && "fill-current")}
                />
                {isSaved ? t("featuredSaved") : t("featuredSave")}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                aria-label={t("featuredShare")}
                onClick={onShare}
              >
                <Share2 aria-hidden />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-4 backdrop-blur-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {isPlaying ? t("nowPlaying") : t("featuredLabel")}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatClock(elapsedSec)} / {formatClock(conversation.durationSec)}
              </span>
            </div>

            <Waveform bars={40} progress={progress} className="h-20" />
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Headphones className="size-3.5" aria-hidden />
            {compactNumber(conversation.totalPlay)}
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Star className="size-3.5" aria-hidden />
            {format.number(conversation.averageRating, {
              maximumFractionDigits: 1,
            })}
            <span className="text-muted-foreground/70">
              ({conversation.ratingCount})
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <MessageCircle className="size-3.5" aria-hidden />
            {compactNumber(conversation.commentCount)}
          </span>

          <span className="ml-auto flex flex-wrap items-center gap-1.5">
            {conversation.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
            <Badge variant="outline">{conversation.topic.name}</Badge>
          </span>
        </footer>
      </div>
    </article>
  );
}
