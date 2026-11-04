"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const TONES = ["primary", "emerald", "cyan"] as const;
type Tone = (typeof TONES)[number];

/** Deterministic pseudo-random so server and client markup match. */
function pseudoRandom(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const BOKEH_TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/10",
  emerald: "bg-emerald-accent/10",
  cyan: "bg-cyan-glow/10",
};

const MOTE_TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/60",
  emerald: "bg-emerald-accent/60",
  cyan: "bg-cyan-glow/60",
};

const SPARKLE_TONE_CLASS: Record<Tone, string> = {
  primary: "text-primary/30",
  emerald: "text-emerald-accent/30",
  cyan: "text-cyan-glow/30",
};

const BOKEH = Array.from({ length: 6 }, (_, i) => ({
  id: `bokeh-${i}`,
  tone: TONES[i % TONES.length],
  size: Math.round(55 + pseudoRandom(i, 1) * 85),
  left: `${Math.round(pseudoRandom(i, 2) * 94)}%`,
  top: `${Math.round(pseudoRandom(i, 3) * 90)}%`,
  duration: Math.round(11 + pseudoRandom(i, 4) * 7),
  delay: Math.round(pseudoRandom(i, 5) * 5),
  driftX: Math.round((pseudoRandom(i, 6) - 0.5) * 36),
  blur: i % 3 === 0 ? "blur-sm" : "blur-xs",
}));

const MOTES = Array.from({ length: 26 }, (_, i) => ({
  id: `mote-${i}`,
  tone: TONES[i % TONES.length],
  size: Math.round(2 + pseudoRandom(i, 10) * 3),
  left: `${Math.round(2 + pseudoRandom(i, 11) * 96)}%`,
  top: `${Math.round(4 + pseudoRandom(i, 12) * 92)}%`,
  duration: Math.round(6 + pseudoRandom(i, 13) * 6),
  delay: Math.round(pseudoRandom(i, 14) * 7),
  drift: Math.round((pseudoRandom(i, 15) - 0.5) * 30),
}));

const SPARKLES = Array.from({ length: 6 }, (_, i) => ({
  id: `sparkle-${i}`,
  tone: TONES[i % TONES.length],
  size: Math.round(14 + pseudoRandom(i, 20) * 14),
  left: `${Math.round(6 + pseudoRandom(i, 21) * 88)}%`,
  top: `${Math.round(8 + pseudoRandom(i, 22) * 84)}%`,
  duration: Math.round(4 + pseudoRandom(i, 23) * 4),
  delay: Math.round(pseudoRandom(i, 24) * 5),
}));

interface HeroVisualsProps {
  className?: string;
}

/** Particle showcase behind the hero content. */
export function HeroVisuals({ className }: HeroVisualsProps) {
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
      {/* Drifting aurora glows */}
      <motion.div
        className="absolute -top-24 -left-16 size-100 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 14%, transparent), transparent 70%)",
        }}
        animate={{ x: [0, 26, 0], y: [0, 18, 0], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 bottom-0 size-125 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--cyan-glow) 10%, transparent), transparent 70%)",
        }}
        animate={{ x: [0, -22, 0], y: [0, -16, 0], opacity: [0.4, 0.75, 0.4] }}
        transition={{
          duration: 18,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Soft floating bokeh */}
      {BOKEH.map((orb) => (
        <motion.span
          key={orb.id}
          className={cn(
            "absolute rounded-full",
            BOKEH_TONE_CLASS[orb.tone],
            orb.blur
          )}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            top: orb.top,
          }}
          animate={{
            y: [0, -22, 0],
            x: [0, orb.driftX, 0],
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Rising mote particles */}
      {MOTES.map((mote) => (
        <motion.span
          key={mote.id}
          className={cn(
            "absolute rounded-full",
            MOTE_TONE_CLASS[mote.tone]
          )}
          style={{
            width: mote.size,
            height: mote.size,
            left: mote.left,
            top: mote.top,
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, mote.drift, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: mote.duration,
            delay: mote.delay,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.5, 1],
          }}
        />
      ))}

      {/* Twinkling sparkles */}
      {SPARKLES.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className={cn(
            "absolute",
            SPARKLE_TONE_CLASS[sparkle.tone]
          )}
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.6, 1.15, 0.6],
            rotate: [0, 45, 90],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="size-full" aria-hidden />
        </motion.span>
      ))}
    </div>
  );
}

interface CardAuraProps {
  className?: string;
}

/** Breathing glow behind the donation card. */
export function CardAura({ className }: CardAuraProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-6 rounded-3xl bg-primary/10 blur-2xl",
        className
      )}
      animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.98, 1.02, 0.98] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
