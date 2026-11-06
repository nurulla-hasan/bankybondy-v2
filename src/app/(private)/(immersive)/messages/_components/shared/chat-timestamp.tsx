"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";

interface ChatTimestampProps {
  date?: string;
  className?: string;
}

const subscribe = () => () => {};

/**
 * Relative labels depend on the viewer's clock, so the server tree renders
 * empty and the client fills in after hydration — same trick as
 * `components/common/relative-time.tsx`.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function ChatTimestamp({ date, className }: ChatTimestampProps) {
  const locale = useLocale();
  const hydrated = useHydrated();

  if (!date) return null;

  return (
    <span className={className}>
      {hydrated ? formatChatTime(date, locale) : null}
    </span>
  );
}

/**
 * Localized relative time. The shared `formatRelativeTime` passes no date-fns
 * locale, so it prints English strings in the Spanish UI.
 */
function formatChatTime(iso: string, locale: string): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);

  if (minutes < 60) return formatter.format(-Math.max(minutes, 0), "minute");

  const hours = Math.round(minutes / 60);
  if (hours < 24) return formatter.format(-hours, "hour");

  const days = Math.round(hours / 24);
  if (days < 7) return formatter.format(-days, "day");

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

/** Header label for a day group: Today / Yesterday / an absolute date. */
export function formatChatDay(iso: string, locale: string): string {
  const day = new Date(iso);
  const today = new Date();
  const diffDays = Math.floor(
    (startOfDay(today).getTime() - startOfDay(day).getTime()) / 86_400_000,
  );

  if (diffDays === 0) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(0, "day");
  }

  if (diffDays === 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-1, "day");
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: diffDays < 7 ? "long" : "short",
    day: "numeric",
    month: "short",
  }).format(day);
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Clock label inside a bubble. */
export function formatChatClock(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
