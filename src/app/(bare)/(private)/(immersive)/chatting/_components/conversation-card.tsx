"use client";

import Image from "next/image";
import {
  AudioLines,
  Bookmark,
  Headphones,
  MessageCircle,
  Pause,
  Play,
  Share2,
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

import { compactNumber, formatClock } from "./format";
import type { MockConversation } from "./mock-data";

interface ConversationCardProps {
  conversation: MockConversation;
  isPlaying: boolean;
  isSaved: boolean;
  onPlay: () => void;
  onToggleSave: () => void;
  onShare: () => void;
}

export function ConversationCard({
  conversation,
  isPlaying,
  isSaved,
  onPlay,
  onToggleSave,
  onShare,
}: ConversationCardProps) {
  const t = useTranslations("Chatting");
  const format = useFormatter();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30">
      <div
        className={cn(
          "relative aspect-video overflow-hidden bg-gradient-to-br",
          conversation.gradient,
        )}
      >
        {conversation.coverImage ? (
          <>
            <Image
              src={conversation.coverImage}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent"
            />
          </>
        ) : (
          <AudioLines
            aria-hidden
            className="absolute right-3 bottom-3 size-12 text-foreground/10"
          />
        )}

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <Badge variant="secondary">{conversation.topic.name}</Badge>
          <Badge variant="secondary">
            {formatClock(conversation.durationSec)}
          </Badge>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            <Button
              size="icon-lg"
              aria-label={
                isPlaying
                  ? t("cardPause", { title: conversation.title })
                  : t("cardPlay", { title: conversation.title })
              }
              onClick={onPlay}
            >
              {isPlaying ? (
                <Pause aria-hidden />
              ) : (
                <Play aria-hidden />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-heading text-sm font-medium sm:text-base">
            {conversation.title}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={conversation.author.profileImage}
                alt={conversation.author.name}
              />
              <AvatarFallback>
                {getInitials(conversation.author.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs text-muted-foreground">
              {conversation.author.name}
            </span>
          </div>
        </div>

        {conversation.topFeelings.length ? (
          <div className="flex flex-wrap gap-1">
            {conversation.topFeelings.slice(0, 2).map((feeling) => (
              <Badge key={feeling.tag} variant="outline" size="sm">
                {feeling.tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Headphones className="size-3.5" aria-hidden />
              {compactNumber(conversation.totalPlay)}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star className="size-3.5" aria-hidden />
              {format.number(conversation.averageRating, {
                maximumFractionDigits: 1,
              })}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageCircle className="size-3.5" aria-hidden />
              {compactNumber(conversation.commentCount)}
            </span>
          </span>

          <span className="flex items-center gap-1">
            <Button
              variant={isSaved ? "secondary" : "ghost"}
              size="icon-sm"
              aria-pressed={isSaved}
              aria-label={
                isSaved
                  ? t("cardUnsave", { title: conversation.title })
                  : t("cardSave", { title: conversation.title })
              }
              onClick={onToggleSave}
            >
              <Bookmark
                aria-hidden
                className={cn(isSaved && "fill-current")}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("cardShare", { title: conversation.title })}
              onClick={onShare}
            >
              <Share2 aria-hidden />
            </Button>
          </span>
        </div>
      </div>
    </article>
  );
}
