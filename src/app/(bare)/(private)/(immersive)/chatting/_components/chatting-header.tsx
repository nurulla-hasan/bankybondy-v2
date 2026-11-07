"use client";

import Link from "next/link";
import { House, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageToggle } from "@/components/common/language-toggle";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useNavLinks } from "@/components/layout/nav-items";
import { NavbarNotifications } from "@/components/layout/navbar-notifications";
import { NavbarUserMenu } from "@/components/layout/navbar-user-menu";
import { Button } from "@/components/ui/button";

/**
 * Barra propia de la vista inmersiva: reemplaza al Navbar global para que la
 * página respire a todo el ancho, sin perder navegación ni controles.
 */
export function ChattingHeader() {
  const t = useTranslations("Chatting");
  const navLinks = useNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="flex h-16 w-full items-center gap-2 px-4 md:px-6">
        <Logo size="md" showTextOnMobile />

        <span aria-hidden className="mx-2 hidden h-6 w-px bg-border md:block" />

        <Button
          variant="ghost"
          className="hidden md:inline-flex"
          render={<Link href="/" />}
        >
          <House aria-hidden />
          {t("headerHome")}
        </Button>
        <Button
          variant="ghost"
          className="hidden md:inline-flex"
          render={<Link href="/messages" />}
        >
          <MessageCircle aria-hidden />
          {t("headerMessages")}
        </Button>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageToggle size="icon" />
          <ThemeToggle size="icon" className="hidden md:inline-flex" />
          <NavbarNotifications />
          <NavbarUserMenu />
          <MobileNav items={navLinks} />
        </div>
      </div>
    </header>
  );
}
