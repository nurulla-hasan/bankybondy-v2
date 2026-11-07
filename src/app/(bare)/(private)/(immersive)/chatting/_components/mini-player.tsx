"use client";

import Image from "next/image";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { CONTAINER_GUTTER } from "@/lib/layout";
import { cn } from "@/lib/utils";

import type { FeedAudio } from "./shared/audio-model";
import { formatClock } from "./shared/format";

interface MiniPlayerProps {
  conversation: FeedAudio;
  isPlaying: boolean;
  elapsedSec: number;
  muted: boolean;
  onToggle: () => void;
  onBack: () => void;
  onForward: () => void;
  onToggleMute: () => void;
  onClose: () => void;
}

export function MiniPlayer({
  conversation,
  isPlaying,
  elapsedSec,
  muted,
  onToggle,
  onBack,
  onForward,
  onToggleMute,
  onClose,
}: MiniPlayerProps) {
  const t = useTranslations("Chatting");
  const progress = conversation.durationSec
    ? Math.min(100, (elapsedSec / conversation.durationSec) * 100)
    : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
      <div
        className={cn(
          "flex w-full items-center gap-3 py-3",
          CONTAINER_GUTTER,
        )}
      >
        {conversation.coverImage ? (
          <Image
            src={conversation.coverImage}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="size-10 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "size-10 shrink-0 rounded-lg bg-linear-to-br",
              conversation.gradient,
            )}
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{conversation.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.author.name}
            <span aria-hidden> · </span>
            {conversation.topic.name}
          </p>

          <div className="mt-1.5 flex items-center gap-2 md:hidden">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatClock(elapsedSec)}
            </span>
          </div>
        </div>

        <div className="hidden flex-1 items-center gap-3 md:flex">
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatClock(elapsedSec)}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatClock(conversation.durationSec)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label={t("playerBack")}
            onClick={onBack}
          >
            <SkipBack aria-hidden />
          </Button>

          <Button
            size="icon"
            aria-label={isPlaying ? t("playerPause") : t("playerPlay")}
            onClick={onToggle}
          >
            {isPlaying ? <Pause aria-hidden /> : <Play aria-hidden />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label={t("playerForward")}
            onClick={onForward}
          >
            <SkipForward aria-hidden />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-pressed={muted}
            aria-label={t("playerMute")}
            onClick={onToggleMute}
          >
            {muted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label={t("playerClose")}
            onClick={onClose}
          >
            <X aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
