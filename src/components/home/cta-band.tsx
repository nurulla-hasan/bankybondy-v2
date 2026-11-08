"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Headphones, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CONTAINER_GUTTER, CONTAINER_MAX_WIDTH } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { useGetMyProfile } from "@/services";

import { Reveal } from "./reveal";

export function CtaBand() {
  const t = useTranslations("Home.cta");
  const reduceMotion = useReducedMotion();
  const { data } = useGetMyProfile();
  const user = data?.data;

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.15, 1], opacity: [0.55, 0.9, 0.55] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div
        className={cn(
          "relative mx-auto w-full",
          CONTAINER_MAX_WIDTH,
          CONTAINER_GUTTER,
        )}
      >
        <Reveal className="mx-auto max-w-3xl rounded-3xl border border-border/70 bg-card/70 p-8 text-center shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("description")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <>
                <Button
                  size="lg"
                  className="cursor-pointer rounded-full px-7"
                  render={<Link href="/chatting" />}
                >
                  <Headphones className="mr-2 size-4" aria-hidden />
                  {t("userPrimary")}
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer rounded-full px-7"
                  render={<Link href="/bonds" />}
                >
                  {t("userSecondary")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="cursor-pointer rounded-full px-7"
                  render={<Link href="/register" />}
                >
                  <UserPlus className="mr-2 size-4" aria-hidden />
                  {t("guestPrimary")}
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer rounded-full px-7"
                  render={<Link href="/login" />}
                >
                  {t("guestSecondary")}
                </Button>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
