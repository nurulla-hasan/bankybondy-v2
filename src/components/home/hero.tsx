"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Headphones,
  Radio,
  Volume2,
  Disc3,
  Music,
  HeartHandshake,
  Handshake,
  Sparkles,
  AudioWaveform,
  Users,
  Mic,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGetMyProfile } from "@/services";

/**
 * Deterministic pseudo-random function for SSR/CSR consistency.
 */
function pseudoRandom(index: number, salt: number = 0) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Icon pool representing Bankybondy's audio, conversation & human connection themes
const FLOATING_ICONS = [
  Headphones,
  Music,
  Radio,
  Volume2,
  Disc3,
  AudioWaveform,
  HeartHandshake,
  Mic,
  Users,
];

const MUSICAL_NOTES = ["♪", "♫", "♩", "♬", "♪", "♫"];

// Precomputed static particle datasets with clean integer values
// to prevent any floating-point string mismatches during React 19 hydration.
const BOKEH_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: `bokeh-${i}`,
  width: Math.round(35 + pseudoRandom(i, 1) * 75),
  height: Math.round(35 + pseudoRandom(i, 2) * 75),
  left: `${Math.round(pseudoRandom(i, 3) * 94)}%`,
  top: `${Math.round(pseudoRandom(i, 4) * 92)}%`,
  duration: Math.round(9 + pseudoRandom(i, 5) * 6),
  delay: Math.round(pseudoRandom(i, 6) * 4),
  driftX: Math.round((pseudoRandom(i, 7) - 0.5) * 18),
}));

const ICON_ITEMS = Array.from({ length: 16 }, (_, i) => ({
  id: `icon-${i}`,
  IconComponent: FLOATING_ICONS[i % FLOATING_ICONS.length],
  left: `${Math.round(3 + pseudoRandom(i, 10) * 92)}%`,
  top: `${Math.round(5 + pseudoRandom(i, 11) * 88)}%`,
  duration: Math.round(7 + pseudoRandom(i, 12) * 5),
  delay: Math.round(pseudoRandom(i, 13) * 3),
  rotate: Math.round((pseudoRandom(i, 15) - 0.5) * 16),
}));

const NOTE_ITEMS = Array.from({ length: 16 }, (_, i) => ({
  id: `note-${i}`,
  note: MUSICAL_NOTES[i % MUSICAL_NOTES.length],
  left: `${Math.round(4 + pseudoRandom(i, 20) * 92)}%`,
  top: `${Math.round(6 + pseudoRandom(i, 21) * 86)}%`,
  fontSize: `${Math.round(18 + pseudoRandom(i, 25) * 16)}px`,
  duration: Math.round(6 + pseudoRandom(i, 22) * 4),
  delay: Math.round(pseudoRandom(i, 23) * 3),
  driftX: Math.round((pseudoRandom(i, 26) - 0.5) * 16),
  rotate: Math.round((pseudoRandom(i, 27) - 0.5) * 20),
}));

const WAVE_ITEMS = Array.from({ length: 6 }, (_, i) => ({
  id: `wave-${i}`,
  left: `${Math.round(5 + pseudoRandom(i, 30) * 85)}%`,
  top: `${Math.round(12 + pseudoRandom(i, 31) * 76)}%`,
  duration: Math.round(4 + pseudoRandom(i, 32) * 3),
  delay: Math.round(pseudoRandom(i, 33) * 2),
}));

export function Hero() {
  const t = useTranslations("Hero");
  const { data: profileData } = useGetMyProfile();
  const user = profileData?.data;

  const [expanded, setExpanded] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Smooth mouse spotlight tracking
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setMousePos({ x, y });
    },
    [],
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full min-h-screen flex flex-col items-center justify-center text-center",
        "bg-background text-foreground overflow-hidden select-none transition-colors duration-300",
      )}
    >
      {/* 1. Subtle High-Tech Grid Pattern */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px)]",
          "bg-size-[4rem_4rem]",
          "mask-[radial-gradient(ellipse_75%_65%_at_50%_45%,#000_65%,transparent_100%)]",
          "opacity-35 dark:opacity-15",
        )}
      />

      {/* 2. Interactive Ambient Radial Aurora & Spotlight (Matches Both Dark & Light Themes) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(circle 650px at ${mousePos.x}% ${mousePos.y}%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 70%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-10%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_100%,color-mix(in_oklch,var(--cyan-glow)_8%,transparent),transparent_70%)]" />

      {/* 3. Soft Ambient Floating Bokeh Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BOKEH_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            className="absolute rounded-full bg-primary/4 dark:bg-primary/8 border border-primary/10 backdrop-blur-[1px]"
            style={{
              width: `${item.width}px`,
              height: `${item.height}px`,
              left: item.left,
              top: item.top,
            }}
            animate={{
              y: [0, -22, 0],
              x: [0, item.driftX, 0],
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 4. Floating Audio & Connection Icons (Adaptive to Light & Dark) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {ICON_ITEMS.map((item) => {
          const Icon = item.IconComponent;
          return (
            <motion.div
              key={item.id}
              className="absolute text-foreground/20 dark:text-foreground/25 hover:text-primary dark:hover:text-primary pointer-events-auto cursor-pointer transition-colors"
              style={{ left: item.left, top: item.top }}
              initial={{ opacity: 0.2 }}
              animate={{
                opacity: [0.2, 0.35, 0.2],
                y: [0, -20, 0],
                rotate: [0, item.rotate, 0],
              }}
              whileHover={{
                scale: 1.35,
                opacity: 0.9,
                transition: { duration: 0.2 },
              }}
              transition={{
                duration: item.duration,
                delay: item.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon className="size-5 sm:size-7 drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]" />
            </motion.div>
          );
        })}
      </div>

      {/* 5. Floating Musical Notes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {NOTE_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            className="absolute text-foreground/16 dark:text-foreground/22 select-none font-bold"
            style={{
              left: item.left,
              top: item.top,
              fontSize: item.fontSize,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, item.driftX, 0],
              opacity: [0.16, 0.3, 0.16],
              rotate: [0, item.rotate, 0],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {item.note}
          </motion.div>
        ))}
      </div>

      {/* 6. Soundwave & Audio Frequency Oscillations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {WAVE_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            className="absolute text-primary/15 dark:text-primary/25"
            style={{
              left: item.left,
              top: item.top,
            }}
            animate={{
              opacity: [0.1, 0.28, 0.1],
              scaleX: [0.95, 1.1, 0.95],
              y: [0, -10, 0],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              width="70"
              height="24"
              viewBox="0 0 70 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12h8l4-8 6 16 6-12 5 8 5-4h8l4-9 6 15 6-6h6" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* 7. Center Hero Content */}
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
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-5 bg-linear-to-b from-foreground via-foreground to-foreground/80 dark:from-white dark:via-white dark:to-white/70 bg-clip-text text-transparent drop-shadow-xs dark:drop-shadow-[0_4px_30px_rgba(255,255,255,0.15)]"
        >
          Bankybondy
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground font-normal tracking-normal mb-8 max-w-xl leading-relaxed"
        >
          {t("title")}
        </motion.p>

        {/* Center Waveform Audio Line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="flex items-center justify-center gap-1 mb-10 w-full max-w-xs text-primary/40 dark:text-primary/50"
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

        {/* 8. Bottom Feature Highlight Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-16 pt-8 border-t border-border/70 grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl text-left"
        >
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/70 dark:bg-card/40 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/40 hover:shadow-xs">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Headphones className="size-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-foreground leading-snug">
              {t("feature1")}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/70 dark:bg-card/40 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-emerald-accent/40 hover:shadow-xs">
            <div className="size-8 rounded-lg bg-emerald-accent/10 flex items-center justify-center shrink-0">
              <HeartHandshake className="size-4 text-emerald-accent" />
            </div>
            <p className="text-xs font-semibold text-foreground leading-snug">
              {t("feature2")}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/70 dark:bg-card/40 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-cyan-glow/40 hover:shadow-xs">
            <div className="size-8 rounded-lg bg-cyan-glow/10 flex items-center justify-center shrink-0">
              <Sparkles className="size-4 text-cyan-glow" />
            </div>
            <p className="text-xs font-semibold text-foreground leading-snug">
              {t("feature3")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
