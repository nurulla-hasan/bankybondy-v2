"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Headphones,
  HeartHandshake,
  Handshake,
  Radio,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeroAmbience } from "@/components/home/hero-ambience";
import { useGetMyProfile } from "@/services";

export function Hero() {
  const t = useTranslations("Hero");
  const { data: profileData } = useGetMyProfile();
  const user = profileData?.data;

  const [expanded, setExpanded] = React.useState(false);

  return (
    <section
      className={cn(
        "relative w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center",
        "bg-background text-foreground overflow-hidden select-none transition-colors duration-300",
      )}
    >
      <HeroAmbience />

      {/* Center Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
        {/* Subtle Live Audio Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/70 dark:bg-card/50 backdrop-blur-md px-4 py-1.5 mb-8 shadow-xs"
        >
          {/* Animated Audio Equalizer Bars */}
          <div className="flex items-center gap-0.5 h-3.5">
            <motion.span
              className="w-0.5 rounded-full bg-primary"
              animate={{ height: ["4px", "14px", "6px", "12px", "4px"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="w-0.5 rounded-full bg-primary/80"
              animate={{ height: ["12px", "4px", "14px", "6px", "12px"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="w-0.5 rounded-full bg-primary"
              animate={{ height: ["6px", "14px", "4px", "10px", "6px"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="w-0.5 rounded-full bg-primary/70"
              animate={{ height: ["10px", "6px", "14px", "4px", "10px"] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="text-xs font-semibold tracking-wide text-foreground">
            {t("badge")}
          </span>
        </motion.div>

        {/* Main Title: Bankybondy with Elegant Shimmer */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-5 text-foreground"
        >
          Bankybondy
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-foreground/70 font-normal tracking-normal mb-8 max-w-xl leading-relaxed text-balance"
        >
          {t("title")}
        </motion.p>

        {/* Center Waveform Audio Line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="flex items-center justify-center gap-1 mb-8 w-full max-w-xs text-primary/60 dark:text-primary/75"
        >
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-border" />
          <svg
            width="44"
            height="18"
            viewBox="0 0 44 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 9h4l3-6 5 12 5-9 4 6 4-3h4l3-6 5 12 5-6" />
          </svg>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-border" />
        </motion.div>

        {/* Interactive CTA Button(s) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-3.5"
        >
          <AnimatePresence mode="wait">
            {user ? (
              expanded ? (
                <motion.div
                  key="expanded-actions"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap items-center justify-center gap-3.5"
                >
                  <Button
                    size="lg"
                    render={<Link href="/bonds" />}
                    className="rounded-full px-7 font-medium shadow-md shadow-primary/20 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <Handshake className="size-4 mr-2" />
                    <span>{t("bonds")}</span>
                    <ArrowRight className="size-4 ml-2" />
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    render={<Link href="/chatting" />}
                    className="rounded-full px-7 font-medium border-border hover:bg-muted shadow-xs hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <Radio className="size-4 mr-2" />
                    <span>{t("weAreChatting")}</span>
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="single-explore"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={() => setExpanded(true)}
                    className="rounded-full px-8 font-medium shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <span>{t("explore")}</span>
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </motion.div>
              )
            ) : (
              <Button
                size="lg"
                render={<Link href="/login" />}
                className="rounded-full px-8 font-medium shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <Headphones className="size-4 mr-2" />
                <span>{t("explore")}</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Live proof */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
          className="mt-8 inline-flex max-w-full flex-wrap items-center justify-center gap-3 rounded-full border border-border/70 bg-card/60 px-3.5 py-2 backdrop-blur-md sm:px-4"
        >
          <div className="flex -space-x-2">
            <span className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary/15 text-primary">
              <Headphones className="size-3.5" />
            </span>
            <span className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-emerald-accent/15 text-emerald-accent">
              <HeartHandshake className="size-3.5" />
            </span>
            <span className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-cyan-glow/15 text-cyan-glow">
              <Sparkles className="size-3.5" />
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-accent/70 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-accent" />
            </span>
            <span className="text-xs font-medium text-foreground/70">
              {t("proof")}
            </span>
          </span>
        </motion.div>

        {/* Feature strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: "easeOut" }}
          className="mt-10 grid w-full max-w-2xl grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card/50 text-left backdrop-blur-md sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          <div className="flex items-center gap-3 p-3.5 transition-colors duration-300 hover:bg-primary/5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Headphones className="size-4 text-primary" />
            </div>
            <p className="text-xs font-semibold leading-snug text-foreground">
              {t("feature1")}
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 transition-colors duration-300 hover:bg-emerald-accent/5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-accent/10">
              <HeartHandshake className="size-4 text-emerald-accent" />
            </div>
            <p className="text-xs font-semibold leading-snug text-foreground">
              {t("feature2")}
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 transition-colors duration-300 hover:bg-cyan-glow/5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-glow/10">
              <Sparkles className="size-4 text-cyan-glow" />
            </div>
            <p className="text-xs font-semibold leading-snug text-foreground">
              {t("feature3")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
