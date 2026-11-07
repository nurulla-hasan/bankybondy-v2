"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageToggle } from "@/components/common/language-toggle";
import { CONTAINER_GUTTER, CONTAINER_MAX_WIDTH } from "@/lib/layout";

import { useNavLinks } from "./nav-items";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { NavbarUserMenu } from "./navbar-user-menu";
import { NavbarSearch } from "./navbar-search";
import { NavbarNotifications } from "./navbar-notifications";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const navLinks = useNavLinks();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md transition-colors",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 w-full items-center justify-between",
          CONTAINER_MAX_WIDTH,
          CONTAINER_GUTTER,
        )}
      >
        {/* Left: Brand Logo */}
        <div className="flex shrink-0 items-center">
          <Logo size="md" showTextOnMobile />
        </div>

        {/* Center: Desktop Navigation Links */}
        <DesktopNav items={navLinks} />

        {/* Right: Controls & User Auth Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Quick Search Palette (⌘K) */}
          <NavbarSearch className="hidden md:inline-flex" />

          {/* Controls: Language, Theme & Notifications */}
          <LanguageToggle size="icon" />
          <ThemeToggle size="icon" className="hidden md:inline-flex" />
          <NavbarNotifications />

          {/* User Auth Profile / Guest CTA */}
          <NavbarUserMenu />

          {/* Mobile Navigation Drawer */}
          <MobileNav items={navLinks} />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
