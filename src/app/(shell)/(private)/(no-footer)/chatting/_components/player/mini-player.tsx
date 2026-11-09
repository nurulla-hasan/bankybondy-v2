"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { CONTAINER_GUTTER } from "@/lib/layout";
import { cn } from "@/lib/utils";

import type { FeedAudio } from "../shared/audio-model";
import { AudioSlider } from "../shared/audio-slider";
import { formatClock } from "../shared/format";
import { VolumeControl } from "../shared/volume-control";

interface MiniPlayerProps {
  conversation: FeedAudio;
  isPlaying: boolean;
  buffering: boolean;
  elapsedSec: number;
  durationSec: number;
  volume: number;
  muted: boolean;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
  onBack: () => void;
  onForward: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
}

export function MiniPlayer({
  conversation,
  isPlaying,
  buffering,
  elapsedSec,
  durationSec,
  volume,
  muted,
  onToggle,
  onSeek,
  onBack,
  onForward,
  onToggleMute,
  onVolumeChange,
  onClose,
}: MiniPlayerProps) {
  const t = useTranslations("Chatting");
  const seekValueText = `${formatClock(elapsedSec)} / ${formatClock(durationSec)}`;
  const playLabel = buffering
    ? t("playerBuffering")
    : isPlaying
      ? t("playerPause")
      : t("playerPlay");

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
          <Link
            href={`/chatting/conversations/${conversation.id}`}
            className="block truncate text-sm font-medium transition-colors hover:text-primary"
          >
            {conversation.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.author.name}
            <span aria-hidden> · </span>
            {conversation.topic.name}
          </p>

          <div className="mt-1.5 flex items-center gap-2 md:hidden">
            <AudioSlider
              value={elapsedSec}
              max={durationSec}
              onValueChange={onSeek}
              ariaLabel={t("playerSeek")}
              valueText={seekValueText}
              className="flex-1"
            />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatClock(elapsedSec)}
            </span>
          </div>
        </div>

        <div className="hidden flex-1 items-center gap-3 md:flex">
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatClock(elapsedSec)}
          </span>
          <AudioSlider
            value={elapsedSec}
            max={durationSec}
            onValueChange={onSeek}
            ariaLabel={t("playerSeek")}
            valueText={seekValueText}
            className="flex-1"
          />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatClock(durationSec)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <VolumeControl
            volume={volume}
            muted={muted}
            onToggleMute={onToggleMute}
            onVolumeChange={onVolumeChange}
            ariaLabel={t("playerVolume")}
            muteLabel={t("playerMute")}
            unmuteLabel={t("playerUnmute")}
          />

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
            aria-label={playLabel}
            onClick={onToggle}
          >
            {buffering ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : isPlaying ? (
              <Pause aria-hidden />
            ) : (
              <Play aria-hidden />
            )}
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
