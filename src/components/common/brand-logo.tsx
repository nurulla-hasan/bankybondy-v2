import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * BankyBondy Fintech Emblem:
 * Interlocking Trust Knot with Radiant Electric Indigo & Cyan Glow
 * Geometry: Two dynamic interlocking loops forming a modern vault & connection node.
 */
export function BrandLogoSvg({ className, size = 40, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BankyBondy Brand Emblem"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      <defs>
        {/* Electric Indigo to High-Tech Violet */}
        <linearGradient
          id="fintech-indigo-glow"
          x1="10"
          y1="10"
          x2="90"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        {/* Vibrant Emerald & Cyan Accent */}
        <linearGradient
          id="fintech-cyan-emerald"
          x1="90"
          y1="10"
          x2="10"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        <filter id="glow-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#4338CA"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      <g filter="url(#glow-shadow)">
        {/* Primary Pillar Ribbon (Banky - Foundation & Trust) */}
        <path
          d="M28 20H48C62.3594 20 74 31.6406 74 46C74 53.6496 70.7077 60.5303 65.4851 65.2917L36 94H20L51.8152 62.1848C56.8488 57.1512 60 50.1983 60 42.5C60 35.5964 54.4036 30 47.5 30H28V20Z"
          fill="url(#fintech-indigo-glow)"
        />

        {/* Interlocking Bond Ribbon (Bondy - Connection & Flow) */}
        <path
          d="M72 80H52C37.6406 80 26 68.3594 26 54C26 46.3504 29.2923 39.4697 34.5149 34.7083L64 6H80L48.1848 37.8152C43.1512 42.8488 40 49.8017 40 57.5C40 64.4036 45.5964 70 52.5 70H72V80Z"
          fill="url(#fintech-cyan-emerald)"
        />

        {/* Central Anchor Node */}
        <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export default BrandLogoSvg;




