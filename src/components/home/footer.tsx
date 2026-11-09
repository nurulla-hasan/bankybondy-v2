import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Heart } from "lucide-react";

import { Logo } from "@/components/common/logo";
import {
  AttributionIcon,
  CreativeCommonsIcon,
  FacebookIcon,
  InstagramIcon,
  ShareAlikeIcon,
} from "@/components/common/brand-icons";
import { CONTAINER_GUTTER, CONTAINER_MAX_WIDTH } from "@/lib/layout";
import { cn } from "@/lib/utils";

const PLATFORM_LINKS = [
  { key: "home", href: "/" },
  { key: "bonds", href: "/bonds" },
  { key: "people", href: "/people" },
  { key: "chatting", href: "/chatting" },
] as const;

const SUPPORT_LINKS = [
  { key: "donate", href: "/donate" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

const LEGAL_LINKS = [
  { key: "terms", href: "/terms" },
  { key: "privacy", href: "/privacy" },
] as const;

const SOCIAL_LINKS = [
  {
    key: "facebook",
    href: "https://www.facebook.com/bankybondy",
    icon: FacebookIcon,
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/bankybondyar",
    icon: InstagramIcon,
  },
] as const;

const LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";

const LICENSE_LINKS = [
  { key: "license", href: LICENSE_URL, icon: CreativeCommonsIcon },
  { key: "licenseAttribution", href: LICENSE_URL, icon: AttributionIcon },
  { key: "licenseShareAlike", href: LICENSE_URL, icon: ShareAlikeIcon },
] as const;

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const columns = [
    { title: t("platform"), links: PLATFORM_LINKS },
    { title: t("support"), links: SUPPORT_LINKS },
    { title: t("legal"), links: LEGAL_LINKS },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border bg-muted/20 transition-colors duration-300">
      {/* Ambient glow + hairline */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-64 w-150 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-emerald-accent/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <div
        className={cn(
          "relative mx-auto pt-12 pb-8 lg:pt-16",
          CONTAINER_MAX_WIDTH,
          CONTAINER_GUTTER,
        )}
      >
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-5">
            <Logo size="lg" showText />

            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>

            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={t(social.key)}
                  className="group flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  <social.icon className="size-4 transition-transform duration-300 group-hover:scale-110" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-xs font-semibold tracking-widest text-foreground/70 uppercase">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t(link.key)}
                        <ArrowUpRight className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 grid gap-5 border-t border-border/70 pt-6 sm:grid-cols-3 sm:items-center">
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year })}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>{t("licenseLine", { year })}</span>

            <span className="flex items-center gap-2">
              {LICENSE_LINKS.map((license) => (
                <a
                  key={license.key}
                  href={license.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={t(license.key)}
                  title={t(license.key)}
                  className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground/80 transition-colors duration-300 hover:border-primary/40 hover:text-primary"
                >
                  <license.icon className="size-4" />
                </a>
              ))}
            </span>

            <a
              href={LICENSE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {t("license")}
            </a>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-self-end">
            {t("madeWith")}
            <Heart className="size-3.5 fill-pink-accent/20 text-pink-accent" />
            <span>{t("byTeam")}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
