"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Coins, Heart, HeartHandshake, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const TONES = ["primary", "emerald", "cyan"] as const;
type Tone = (typeof TONES)[number];

/** Deterministic pseudo-random so server and client markup match. */
function pseudoRandom(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const ORB_TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/10",
  emerald: "bg-emerald-accent/10",
  cyan: "bg-cyan-glow/10",
};

const SPARK_TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/70",
  emerald: "bg-emerald-accent/70",
  cyan: "bg-cyan-glow/70",
};

const ICON_TONE_CLASS: Record<Tone, string> = {
  primary: "text-primary/25",
  emerald: "text-emerald-accent/25",
  cyan: "text-cyan-glow/25",
};

const DONATION_ICONS = [Heart, HeartHandshake, Sparkles, Coins];

const ORBS = Array.from({ length: 8 }, (_, i) => ({
  id: `orb-${i}`,
  tone: TONES[i % TONES.length],
  size: Math.round(55 + pseudoRandom(i, 1) * 95),
  left: `${Math.round(pseudoRandom(i, 2) * 90)}%`,
  top: `${Math.round(pseudoRandom(i, 3) * 85)}%`,
  duration: Math.round(10 + pseudoRandom(i, 4) * 8),
  delay: Math.round(pseudoRandom(i, 5) * 4),
  driftX: Math.round((pseudoRandom(i, 6) - 0.5) * 30),
}));

const SPARKS = Array.from({ length: 16 }, (_, i) => ({
  id: `spark-${i}`,
  tone: TONES[i % TONES.length],
  size: Math.round(2 + pseudoRandom(i, 10) * 3),
  left: `${Math.round(4 + pseudoRandom(i, 11) * 92)}%`,
  top: `${Math.round(6 + pseudoRandom(i, 12) * 88)}%`,
  duration: Math.round(8 + pseudoRandom(i, 13) * 8),
  delay: Math.round(pseudoRandom(i, 14) * 6),
  drift: Math.round((pseudoRandom(i, 15) - 0.5) * 40),
}));

const ICONS = Array.from({ length: 8 }, (_, i) => ({
  id: `icon-${i}`,
  tone: TONES[i % TONES.length],
  IconComponent: DONATION_ICONS[i % DONATION_ICONS.length],
  left: `${Math.round(4 + pseudoRandom(i, 20) * 90)}%`,
  top: `${Math.round(6 + pseudoRandom(i, 21) * 84)}%`,
  duration: Math.round(7 + pseudoRandom(i, 22) * 5),
  delay: Math.round(pseudoRandom(i, 23) * 4),
  rotate: Math.round((pseudoRandom(i, 24) - 0.5) * 24),
}));

interface DonationAmbienceProps {
  className?: string;
}

export function DonationAmbience({ className }: DonationAmbienceProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      {/* Soft aurora glows */}
      <div className="absolute -top-40 left-1/2 h-100 w-175 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-1/3 -left-24 size-80 rounded-full bg-cyan-glow/5 blur-3xl" />
      <div className="absolute -right-24 bottom-0 size-72 rounded-full bg-emerald-accent/5 blur-3xl" />

      {/* Floating bokeh orbs */}
      {ORBS.map((orb) => (
        <motion.span
          key={orb.id}
          className={cn(
            "absolute rounded-full",
            ORB_TONE_CLASS[orb.tone]
          )}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            top: orb.top,
          }}
          animate={{
            y: [0, -24, 0],
            x: [0, orb.driftX, 0],
            scale: [1, 1.1, 1],
            opacity: [0.22, 0.5, 0.22],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Rising sparks */}
      {SPARKS.map((spark) => (
        <motion.span
          key={spark.id}
          className={cn(
            "absolute rounded-full",
            SPARK_TONE_CLASS[spark.tone]
          )}
          style={{
            width: spark.size,
            height: spark.size,
            left: spark.left,
            top: spark.top,
          }}
          animate={{
            y: [0, -130, -280],
            x: [0, spark.drift, 0],
            opacity: [0, 0.75, 0],
          }}
          transition={{
            duration: spark.duration,
            delay: spark.delay,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.55, 1],
          }}
        />
      ))}

      {/* Floating donation-themed icons */}
      {ICONS.map((item) => {
        const Icon = item.IconComponent;

        return (
          <motion.span
            key={item.id}
            className={cn("absolute", ICON_TONE_CLASS[item.tone])}
            style={{ left: item.left, top: item.top }}
            animate={{
              y: [0, -18, 0],
              rotate: [0, item.rotate, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className="size-5 sm:size-6" aria-hidden />
          </motion.span>
        );
      })}
    </div>
  );
}
