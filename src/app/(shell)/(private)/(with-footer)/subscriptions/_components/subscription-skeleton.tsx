"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SubscriptionSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      {/* Current plan card skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-3.5 w-64 max-w-full" />
        </CardContent>
      </Card>

      {/* Plans grid skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-9 rounded-lg" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  {index === 0 ? <Skeleton className="h-5 w-14 rounded-md" /> : null}
                </div>
              </CardHeader>

              <CardContent className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </CardContent>
            </div>

            {/* Bottom buttons (paid plans have 2 buttons) */}
            <div className="p-6 pt-0">
              {index === 0 ? (
                <div className="h-9" />
              ) : (
                <div className="grid w-full gap-2">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
