"use client";

import { useLocale } from "next-intl";

import { formatChatDay, useHydrated } from "../shared/chat-timestamp";

export function DaySeparator({ date }: { date: string }) {
  const locale = useLocale();
  const hydrated = useHydrated();

  return (
    <div className="sticky top-0 z-10 flex justify-center py-3">
      <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
        {hydrated ? formatChatDay(date, locale) : "\u00A0"}
      </span>
    </div>
  );
}
