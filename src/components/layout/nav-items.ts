"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Home,
  Handshake,
  Users,
  Radio,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

export type NavItemKey = "Home" | "Donate" | "Bonds" | "People" | "Chatting";

export interface NavItemConfig {
  key: NavItemKey;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

export interface NavLinkItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

/**
 * Ordered exactly as in design: Home, Donate, Bonds, People, We are chatting.
 * Messages is a personal workspace and lives in the profile menu instead of the
 * main nav (see `navbar-user-menu.tsx`), with its unread badge.
 */
export const NAV_ITEMS: readonly NavItemConfig[] = [
  { key: "Home", href: "/", icon: Home },
  { key: "Donate", href: "/donate", icon: HeartHandshake },
  { key: "Bonds", href: "/bonds", icon: Handshake },
  { key: "People", href: "/people", icon: Users },
  { key: "Chatting", href: "/chatting", icon: Radio },
] as const;

/**
 * Hook to retrieve localized navigation items.
 * Can be extended with API-driven badges (e.g., unread message counts).
 */
export function useNavLinks(
  dynamicBadges?: Partial<Record<NavItemKey, number | string>>,
): NavLinkItem[] {
  const t = useTranslations("Navbar");

  return React.useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        name: t(item.key),
        href: item.href,
        icon: item.icon,
        badge: dynamicBadges?.[item.key] ?? item.badge,
      })),
    [t, dynamicBadges],
  );
}
