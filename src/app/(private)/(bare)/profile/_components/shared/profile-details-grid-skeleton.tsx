"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function RowCardSkeleton({ rows, titleWidth }: { rows: number; titleWidth: string }) {
  return (
    <Card aria-hidden className="rounded-2xl">
      <CardHeader>
        <Skeleton className={titleWidth} />
      </CardHeader>

      <CardContent className="space-y-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BlockCardSkeleton({
  titleWidth,
  lines,
}: {
  titleWidth: string;
  lines: number;
}) {
  return (
    <Card aria-hidden className="rounded-2xl">
      <CardHeader>
        <Skeleton className={titleWidth} />
      </CardHeader>

      <CardContent className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton
            key={index}
            className={index === lines - 1 ? "h-4 w-2/3" : "h-4 w-full"}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function LocationCardSkeleton() {
  return (
    <Card aria-hidden className="rounded-2xl">
      <CardHeader className="flex-row items-start gap-3">
        <Skeleton className="size-9 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-40" />

        <div className="space-y-3 rounded-xl bg-muted/40 p-3">
          <Skeleton className="h-9 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>

        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export function ProfileDetailsGridSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <RowCardSkeleton rows={5} titleWidth="h-5 w-40" />
        <LocationCardSkeleton />
        <RowCardSkeleton rows={3} titleWidth="h-5 w-16" />
      </div>

      <div className="space-y-4 lg:col-span-3">
        <BlockCardSkeleton titleWidth="h-5 w-24" lines={3} />
        <BlockCardSkeleton titleWidth="h-5 w-16" lines={2} />
        <BlockCardSkeleton titleWidth="h-5 w-44" lines={4} />
      </div>
    </div>
  );
}
