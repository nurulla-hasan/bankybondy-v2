"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AudioSlider } from "./audio-slider";

interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  ariaLabel: string;
  muteLabel: string;
  unmuteLabel: string;
  sliderClassName?: string;
}

export function VolumeControl({
  volume,
  muted,
  onToggleMute,
  onVolumeChange,
  ariaLabel,
  muteLabel,
  unmuteLabel,
  sliderClassName,
}: VolumeControlProps) {
  const effectiveVolume = muted ? 0 : volume;
  const Icon = muted ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-pressed={muted}
        aria-label={muted ? unmuteLabel : muteLabel}
        onClick={onToggleMute}
      >
        <Icon aria-hidden />
      </Button>
      <AudioSlider
        value={effectiveVolume}
        max={1}
        step={0.01}
        onValueChange={onVolumeChange}
        ariaLabel={ariaLabel}
        valueText={`${Math.round(effectiveVolume * 100)}%`}
        className={cn(
          "hidden w-24 md:block",
          sliderClassName,
        )}
      />
    </div>
  );
}
