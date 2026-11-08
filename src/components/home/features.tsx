"use client";

import { AudioLines, HeartHandshake, Scale, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { CONTAINER_GUTTER, CONTAINER_MAX_WIDTH } from "@/lib/layout";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

const FEATURES = [
  { key: "feature1", Icon: AudioLines, tone: "bg-primary/10 text-primary" },
  {
    key: "feature2",
    Icon: HeartHandshake,
    tone: "bg-emerald-accent/10 text-emerald-accent",
  },
  { key: "feature3", Icon: Scale, tone: "bg-cyan-glow/10 text-cyan-glow" },
  {
    key: "feature4",
    Icon: Sparkles,
    tone: "bg-violet-accent/10 text-violet-accent",
  },
] as const;

export function Features() {
  const t = useTranslations("Home.features");

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        className={cn(
          "mx-auto w-full",
          CONTAINER_MAX_WIDTH,
          CONTAINER_GUTTER,
        )}
      >
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("description")}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, Icon, tone }, index) => (
            <Reveal key={key} delay={index * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-primary/5">
                <div
                  aria-hidden
                  className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/5 blur-2xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-0"
                />
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110",
                    tone,
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-5 font-heading text-base font-semibold">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`${key}.description`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
