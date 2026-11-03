"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    console.error("Global application error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" />
      </div>

      <span className="font-mono text-sm font-semibold uppercase tracking-wider text-destructive">
        Application Error
      </span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while rendering this page. You can try refreshing or returning to home.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
          {error.message}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>
          <RotateCcw className="size-4" />
          Try Again
        </Button>
        <Button variant="outline" render={<Link href="/" />}>
          <Home className="size-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
