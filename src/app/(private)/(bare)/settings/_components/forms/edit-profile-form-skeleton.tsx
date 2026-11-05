"use client";

import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function FieldSkeleton({
  labelWidth = "w-20",
  controlClassName = "h-9",
}: {
  labelWidth?: string;
  controlClassName?: string;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className={`h-3.5 ${labelWidth}`} />
      <Skeleton className={`w-full rounded-lg ${controlClassName}`} />
    </div>
  );
}

function FormCardSkeleton({
  titleWidth,
  withDescription,
  children,
}: {
  titleWidth: string;
  withDescription?: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="gap-2">
        <Skeleton className={`h-5 ${titleWidth}`} />
        {withDescription ? <Skeleton className="h-4 w-44" /> : null}
      </CardHeader>

      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function EditProfileFormSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <Card className="gap-0 rounded-2xl py-0">
        <Skeleton className="h-32 w-full rounded-none sm:h-40" />

        <div className="flex flex-wrap items-center gap-4 p-5">
          <div className="-mt-16 shrink-0">
            <Skeleton className="size-20 rounded-full ring-4 ring-card sm:size-24" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-64 max-w-full" />
          </div>

          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <FormCardSkeleton titleWidth="w-20">
            <FieldSkeleton labelWidth="w-14" />
            <FieldSkeleton labelWidth="w-16" />
            <FieldSkeleton labelWidth="w-16" />
          </FormCardSkeleton>

          <FormCardSkeleton titleWidth="w-24">
            <FieldSkeleton labelWidth="w-24" controlClassName="min-h-28" />
            <FieldSkeleton labelWidth="w-14" />
          </FormCardSkeleton>
        </div>

        <div className="space-y-5">
          <FormCardSkeleton titleWidth="w-16">
            <FieldSkeleton labelWidth="w-14" />
            <FieldSkeleton labelWidth="w-18" />
            <FieldSkeleton labelWidth="w-28" />
          </FormCardSkeleton>

          <FormCardSkeleton titleWidth="w-14" withDescription>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-xl" />
            ))}
            <Skeleton className="h-8 w-28 rounded-lg" />
          </FormCardSkeleton>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <Skeleton className="h-3.5 w-44" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}
