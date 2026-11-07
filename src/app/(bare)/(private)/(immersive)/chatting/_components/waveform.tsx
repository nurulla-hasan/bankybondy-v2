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
}

export function Waveform({ bars = 28, progress = 0, className }: WaveformProps) {
  return (
    <div
      aria-hidden
      className={cn("flex h-16 w-full items-center gap-1", className)}
    >
      {Array.from({ length: bars }).map((_, index) => {
        const height = BAR_HEIGHTS[index % BAR_HEIGHTS.length];
        const played = (index / bars) * 100 < progress;

        return (
          <span
            key={index}
            className={cn(
              "flex-1 rounded-full transition-colors duration-300",
              played ? "bg-primary" : "bg-foreground/15",
            )}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}
