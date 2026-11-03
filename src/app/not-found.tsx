import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-8 animate-pulse" />
      </div>

      <span className="font-mono text-sm font-semibold uppercase tracking-wider text-primary">
        Error 404
      </span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/" />}>
          <Home className="size-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
