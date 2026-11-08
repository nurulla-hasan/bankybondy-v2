"use client";

import { Headphones, Handshake, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { CONTAINER_GUTTER, CONTAINER_MAX_WIDTH } from "@/lib/layout";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";
import { SectionAmbience } from "./section-ambience";

const STEPS = [
  { key: "step1", Icon: UserRound },
  { key: "step2", Icon: Headphones },
  { key: "step3", Icon: Handshake },
] as const;

export function HowItWorks() {
  const t = useTranslations("Home.howItWorks");

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <SectionAmbience />

      <div
        className={cn(
          "relative mx-auto w-full",
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

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden border-t border-dashed border-border/70 md:block"
          />

          {STEPS.map(({ key, Icon }, index) => (
            <Reveal key={key} delay={index * 0.1} className="relative">
              <div className="group flex h-full flex-col items-center rounded-2xl border border-border/70 bg-card/60 p-6 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                  <Icon className="size-6" aria-hidden />
                  <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-[10px] font-bold text-muted-foreground">
                    0{index + 1}
                  </span>
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
