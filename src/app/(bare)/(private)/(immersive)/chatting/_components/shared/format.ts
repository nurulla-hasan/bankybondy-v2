export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${trimDecimals(value / 1_000_000)}M`;
  if (value >= 1_000) return `${trimDecimals(value / 1_000)}k`;
  return String(value);
}

function trimDecimals(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}
