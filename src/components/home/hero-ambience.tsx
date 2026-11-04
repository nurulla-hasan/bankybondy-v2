"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AudioWaveform,
  Disc3,
  Headphones,
  HeartHandshake,
  Mic,
  Music,
  Radio,
  Users,
  Volume2,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** Deterministic pseudo-random so server and client markup match. */
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

const BOKEH_ITEMS = Array.from({ length: 8 }, (_, i) => ({
  id: `bokeh-${i}`,
  size: Math.round(30 + pseudoRandom(i, 1) * 60),
  left: `${Math.round(pseudoRandom(i, 3) * 94)}%`,
  top: `${Math.round(pseudoRandom(i, 4) * 92)}%`,
  duration: Math.round(9 + pseudoRandom(i, 5) * 6),
  delay: Math.round(pseudoRandom(i, 6) * 4),
  driftX: Math.round((pseudoRandom(i, 7) - 0.5) * 18),
}));

// Icon, note and wave layers stay near the outer margins so they never
// sit on top of the centered hero copy.
const EDGE_LEFT = (i: number, salt: number) =>
  `${Math.round(2 + pseudoRandom(i, salt) * 15)}%`;
const EDGE_RIGHT = (i: number, salt: number) =>
  `${Math.round(83 + pseudoRandom(i, salt) * 14)}%`;
const edgeX = (i: number, salt: number) =>
  i % 2 === 0 ? EDGE_LEFT(i, salt) : EDGE_RIGHT(i, salt);

const ICON_ITEMS = Array.from({ length: 16 }, (_, i) => ({
  id: `icon-${i}`,
  IconComponent: FLOATING_ICONS[i % FLOATING_ICONS.length],
  left: edgeX(i, 10),
  top: `${Math.round(6 + pseudoRandom(i, 11) * 82)}%`,
  duration: Math.round(7 + pseudoRandom(i, 12) * 5),
  delay: Math.round(pseudoRandom(i, 13) * 3),
  rotate: Math.round((pseudoRandom(i, 15) - 0.5) * 16),
}));

const NOTE_ITEMS = Array.from({ length: 16 }, (_, i) => ({
  id: `note-${i}`,
  note: MUSICAL_NOTES[i % MUSICAL_NOTES.length],
  left: edgeX(i, 20),
  top: `${Math.round(6 + pseudoRandom(i, 21) * 82)}%`,
  fontSize: `${Math.round(18 + pseudoRandom(i, 25) * 16)}px`,
  duration: Math.round(6 + pseudoRandom(i, 22) * 4),
  delay: Math.round(pseudoRandom(i, 23) * 3),
  driftX: Math.round((pseudoRandom(i, 26) - 0.5) * 16),
  rotate: Math.round((pseudoRandom(i, 27) - 0.5) * 20),
}));

const WAVE_ITEMS = Array.from({ length: 6 }, (_, i) => ({
  id: `wave-${i}`,
  left: edgeX(i, 30),
  top: `${Math.round(12 + pseudoRandom(i, 31) * 72)}%`,
  duration: Math.round(4 + pseudoRandom(i, 32) * 3),
  delay: Math.round(pseudoRandom(i, 33) * 2),
}));

interface HeroAmbienceProps {
  className?: string;
}

/** Decorative, pointer-aware audio ambience for the home hero. */
export function HeroAmbience({ className }: HeroAmbienceProps) {
  const shouldReduceMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 45 });

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInside) return;

      setMousePos({
        x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
        y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {/* Subtle high-tech grid pattern */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px)]",
          "bg-size-[4rem_4rem]",
          "mask-[radial-gradient(ellipse_75%_65%_at_50%_45%,#000_65%,transparent_100%)]",
          "opacity-35 dark:opacity-15"
        )}
      />

      {/* Ambient aura + pointer spotlight */}
      {!shouldReduceMotion && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            background: `radial-gradient(circle 650px at ${mousePos.x}% ${mousePos.y}%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 70%)`,
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-10%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_100%,color-mix(in_oklch,var(--cyan-glow)_8%,transparent),transparent_70%)]" />

      {!shouldReduceMotion && (
        <>
          {/* Soft floating bokeh orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {BOKEH_ITEMS.map((item) => (
              <motion.div
                key={item.id}
                className="absolute rounded-full bg-primary/4 dark:bg-primary/8 border border-primary/10 backdrop-blur-xs"
                style={{
                  width: item.size,
                  height: item.size,
                  left: item.left,
                  top: item.top,
                }}
                animate={{
                  y: [0, -22, 0],
                  x: [0, item.driftX, 0],
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.45, 0.2],
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

          {/* Floating audio & connection icons */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {ICON_ITEMS.map((item) => {
              const Icon = item.IconComponent;
              return (
                <motion.div
                  key={item.id}
                  className="absolute text-foreground/30 dark:text-foreground/40 hover:text-primary dark:hover:text-primary pointer-events-auto cursor-pointer transition-colors"
                  style={{ left: item.left, top: item.top }}
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
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

          {/* Floating musical notes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {NOTE_ITEMS.map((item) => (
              <motion.div
                key={item.id}
                className="absolute text-foreground/22 dark:text-foreground/30 select-none font-bold"
                style={{
                  left: item.left,
                  top: item.top,
                  fontSize: item.fontSize,
                }}
                animate={{
                  y: [0, -25, 0],
                  x: [0, item.driftX, 0],
                  opacity: [0.22, 0.38, 0.22],
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

          {/* Soundwave & audio frequency oscillations */}
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
        </>
      )}
    </div>
  );
}
