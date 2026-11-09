"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FavoriteCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Aspect-video media area */}
      <div className="relative aspect-video overflow-hidden bg-muted/30 p-3 flex justify-between items-start">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-12 rounded-md" />
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4 mb-1" />

        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Footer buttons */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </div>
    </article>
  );
}
