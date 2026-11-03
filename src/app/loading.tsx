import { Spinner } from "@/components/ui/spinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute size-16 animate-ping rounded-full bg-primary/10" />
        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
          <Spinner className="size-6 text-primary" />
        </div>
      </div>
      <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
