"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { NavLinkItem } from "./nav-items";

interface DesktopNavProps {
  items: NavLinkItem[];
  className?: string;
}

export function DesktopNav({ items, className }: DesktopNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "hidden md:flex items-center justify-center gap-7 lg:gap-8 flex-1 px-4",
        className,
      )}
    >
      {items.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative py-2 text-sm font-medium transition-colors cursor-pointer select-none",
              isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{link.name}</span>
            {isActive && (
              <motion.div
                layoutId="navbar-active-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default DesktopNav;
