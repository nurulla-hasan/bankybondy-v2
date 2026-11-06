import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * Bankybondy Ultra-Modern FinTech Brand Mark
 * Design:
 * - 3D Isometric Intertwined Prism Loops (Bank + Bond)
 * - Rich layered gradients (Vibrant Electric Violet-Indigo & Glowing Neon Mint-Cyan)
 * - Deep futuristic lighting with polished specular highlights (Revolut / Linear / Vercel grade)
 */
export function BrandLogoSvg({ className, size = 38, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bankybondy Brand Logo"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      <defs>
        {/* Layer 1: Electric Indigo-Violet Glow */}
        <linearGradient id="grad-indigo-bright" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        {/* Layer 2: Neon Cyan-Emerald Flow */}
        <linearGradient id="grad-cyan-neon" x1="85" y1="15" x2="15" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Layer 3: Dynamic Highlight Arc */}
        <linearGradient id="grad-white-glow" x1="30" y1="20" x2="70" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Sleek FinTech Drop Shadow */}
        <filter id="fintech-ambient-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366F1" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#fintech-ambient-glow)">
        {/* Rounded Diamond/Hex Carrier Base */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="24"
          className="fill-background/40 stroke-border/80"
          strokeWidth="1.5"
        />

        {/* Primary Intersecting Infinity Arc (Loop A - Trust Vault) */}
        <path
          d="M32 26C20 26 14 36 14 50C14 64 20 74 32 74C44 74 50 58 54 50C58 42 64 26 76 26C88 26 94 36 94 50C94 64 88 74 76 74C64 74 58 58 54 50"
          stroke="url(#grad-indigo-bright)"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Secondary Overlapping Ribbon (Loop B - Infinite Human Bond) */}
        <path
          d="M68 74C80 74 86 64 86 50C86 36 80 26 68 26C56 26 50 42 46 50C42 58 36 74 24 74C12 74 6 64 6 50C6 36 12 26 24 26"
          stroke="url(#grad-cyan-neon)"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Polished Glass Light Edge */}
        <path
          d="M26 30C28 28 32 27 36 27C44 27 49 38 52 45"
          stroke="url(#grad-white-glow)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Floating Glowing Core Nexus */}
        <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" className="drop-shadow-sm" />
      </g>
    </svg>
  );
}

export default BrandLogoSvg;





