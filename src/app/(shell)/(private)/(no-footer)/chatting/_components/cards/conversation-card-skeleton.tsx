"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ConversationCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Aspect-video media area */}
      <div className="relative aspect-video overflow-hidden bg-muted/30 p-3 flex justify-between items-start">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-12 rounded-md" />
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Skeleton className="h-5 w-3/4 mb-3" />

          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Footer stats & action buttons */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>

          <div className="flex items-center gap-1">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="size-7 rounded-md" />
          </div>
        </div>
      </div>
    </article>
  );
}
