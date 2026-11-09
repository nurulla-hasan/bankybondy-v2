"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedConversationSkeleton() {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7">
      <div className="space-y-5">
        {/* Header: Featured badge & duration */}
        <header className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-4 w-28" />
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          {/* Left column: Title, description, feelings, author, buttons */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 max-w-sm" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <div className="flex gap-1 pt-1">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Skeleton className="h-11 w-28 rounded-xl" />
              <Skeleton className="h-11 w-28 rounded-xl" />
              <Skeleton className="h-11 w-36 rounded-xl" />
              <Skeleton className="size-10 rounded-xl" />
            </div>
          </div>

          {/* Right column: Waveform box */}
          <div className="rounded-2xl border border-border bg-background/50 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>

        {/* Footer: Stats & topic badges */}
        <footer className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </footer>
      </div>
    </article>
  );
}
