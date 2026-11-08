"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SectionAmbienceProps {
  className?: string;
}

export function SectionAmbience({ className }: SectionAmbienceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <motion.div
        className="absolute -left-28 top-1/4 size-72 rounded-full bg-primary/10 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 48, 0], y: [0, -32, 0], scale: [1, 1.2, 1] }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-0 size-80 rounded-full bg-emerald-accent/10 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -40, 0], y: [0, 36, 0], scale: [1, 1.15, 1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
