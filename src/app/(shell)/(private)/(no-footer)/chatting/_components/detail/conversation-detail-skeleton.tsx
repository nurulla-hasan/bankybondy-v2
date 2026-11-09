"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ConversationDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40 rounded-xl" />

      {/* Main card */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        {/* Aspect-video banner */}
        <div className="relative aspect-video max-h-72 w-full overflow-hidden bg-muted/40 p-5 sm:p-6 flex items-end sm:aspect-auto sm:h-64">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-14 rounded-md" />
            <Skeleton className="h-6 w-14 rounded-md" />
          </div>
        </div>

        {/* Content body */}
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2 w-full max-w-xl">
              <Skeleton className="h-8 w-3/4 max-w-sm" />

              <div className="flex items-center gap-2.5 pt-1">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-20 ml-2" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />
          </div>

          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>

          {/* Audio player box */}
          <div className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid columns for comments (left) & feedback (right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Comments skeleton card */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="space-y-3 pt-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-2xl border border-border/70 bg-background/50 p-4"
              >
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback skeleton card */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-1.5 pt-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="size-7 rounded-md" />
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-48" />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-7 w-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
