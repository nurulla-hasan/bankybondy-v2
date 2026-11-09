"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface AudioSliderProps {
  value: number;
  max: number;
  onValueChange: (value: number) => void;
  ariaLabel: string;
  valueText?: string;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function AudioSlider({
  value,
  max,
  onValueChange,
  ariaLabel,
  valueText,
  step = 1,
  disabled = false,
  className,
}: AudioSliderProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeValue = safeMax > 0 ? Math.min(Math.max(0, value), safeMax) : 0;
  const progress = safeMax > 0 ? `${(safeValue / safeMax) * 100}%` : "0%";

  return (
    <input
      type="range"
      min={0}
      max={safeMax}
      step={step}
      value={safeValue}
      disabled={disabled || safeMax === 0}
      onChange={(event) => onValueChange(Number(event.target.value))}
      aria-label={ariaLabel}
      aria-valuetext={valueText}
      className={cn("audio-range w-full", className)}
      style={{ "--range-progress": progress } as CSSProperties}
    />
  );
}
