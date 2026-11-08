"use client";

import { Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";

export function ValuesMarquee() {
  const t = useTranslations("Home.marquee");
  const words = t.raw("words") as string[];

  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/20 py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-background to-transparent"
      />

      <p className="sr-only">{words.join(", ")}</p>

      {/* One strip: enters fully off-screen right, exits fully off-screen left,
          then the next cycle restarts from the right — like a sunrise. */}
      <div aria-hidden className="marquee-track flex w-max items-center gap-10">
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="flex items-center gap-3 font-heading text-lg font-semibold tracking-tight text-muted-foreground/70 sm:text-xl"
          >
            {word}
            <Sparkle className="size-3 text-primary/50" />
          </span>
        ))}
      </div>
    </section>
  );
}
