"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Deterministic pseudo-waveform. The heights never change between renders, so
 * the server and the client paint the same bars.
 */
const BAR_HEIGHTS = [
  38, 62, 44, 78, 52, 88, 46, 70, 34, 58, 82, 48, 66, 40, 74, 56, 92, 50, 64,
  42, 80, 54, 68, 36, 76, 60, 46, 86,
];

interface WaveformProps {
  bars?: number;
  /** 0-100. Bars below this share are painted as already played. */
  progress?: number;
  className?: string;
  /** Gently oscillate bar heights, like a live audio equalizer. */
  animated?: boolean;
}

export function Waveform({
  bars = 28,
  progress = 0,
  className,
  animated = false,
}: WaveformProps) {
  return (
    <div
      aria-hidden
      className={cn("flex h-16 w-full items-center gap-1", className)}
    >
      {Array.from({ length: bars }).map((_, index) => {
        const height = BAR_HEIGHTS[index % BAR_HEIGHTS.length];
        const played = (index / bars) * 100 < progress;
        const barClassName = cn(
          "flex-1 rounded-full transition-colors duration-300",
          played ? "bg-primary" : "bg-foreground/15",
        );
        const style = { height: `${height}%` };

        if (!animated) {
          return <span key={index} className={barClassName} style={style} />;
        }

        return (
          <motion.span
            key={index}
            className={barClassName}
            style={style}
            animate={{ scaleY: [1, 0.5, 1.15, 0.7, 1] }}
            transition={{
              duration: 1.6 + (index % 5) * 0.25,
              delay: (index % 8) * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}