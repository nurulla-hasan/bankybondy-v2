"use client";

import { useSyncExternalStore } from "react";
import { formatRelativeTime } from "@/lib/utils";

interface RelativeTimeProps {
  date: string;
  className?: string;
}

const subscribe = () => () => {};

export function RelativeTime({ date, className }: RelativeTimeProps) {
  // Relative labels depend on the viewer's clock: SSR renders empty, then the
  // client snapshot kicks in after hydration so both trees stay identical.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <span className={className}>{hydrated ? formatRelativeTime(date) : null}</span>
  );
}
