"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BondRequestCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-16 shrink-0" />
      </div>

      <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-border/70" aria-hidden />
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <span className="h-px flex-1 bg-border/70" aria-hidden />
        </div>

        <div className="space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      <Skeleton className="h-7 w-28 rounded-full" />

      <div className="mt-auto flex items-center gap-2 border-t border-border/70 pt-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="size-9 shrink-0" />
        <Skeleton className="size-9 shrink-0" />
      </div>
    </div>
  );
}
