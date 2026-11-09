import * as React from "react";
import { Users, HeartHandshake, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageToggle } from "@/components/common/language-toggle";
import { getTranslations } from "next-intl/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Auth");
  const common = await getTranslations("Common");

  return (
    <>
      <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left Column: Visual & Bankybondy Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-muted/20 border-r border-border overflow-hidden">
        {/* Subtle Decorative Background Glow using theme tokens */}
        <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-primary/15 blur-3xl opacity-70" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-cyan-glow/15 blur-3xl opacity-50" />


        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Logo size="lg" showText />
        </div>

        {/* Center: Hero Branding & Feature Highlights */}
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <HeartHandshake className="size-3.5" />
            {t("authPill")}
          </div>

          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-tight font-heading">
            {t("authHeroTitle")}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("authHeroSubtitle")}
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-background border border-border text-primary shadow-xs">
                <Users className="size-4" />
              </div>
              <span>{t("authFeature1")}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-background border border-border text-emerald-accent shadow-xs">
                <HeartHandshake className="size-4" />
              </div>
              <span>{t("authFeature2")}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="p-1.5 rounded-lg bg-background border border-border text-cyan-glow shadow-xs">
                <ShieldCheck className="size-4" />
              </div>
              <span>{t("authFeature3")}</span>
            </div>

          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-xs text-muted-foreground flex items-center justify-between border-t border-border pt-6">
          <span>&ldquo;{t("authTagline")}&rdquo;</span>
          <span>{common("brandTagline")}</span>
        </div>
      </div>

      {/* Right Column: Centered Auth Child with Floating Switchers */}
      <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center p-6 sm:p-10">
        {/* Floating Switchers in top-right */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile Header Logo */}
        <div className="lg:hidden mb-6">
          <Logo size="md" showText />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-xl animate-in fade-in-50 duration-300">
          {children}
        </div>

      </div>
      </div>
    </>
  );
}


