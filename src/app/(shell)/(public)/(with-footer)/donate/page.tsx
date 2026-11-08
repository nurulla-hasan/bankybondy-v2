"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Activity,
  Lock,
  LogIn,
  Percent,
  ReceiptText,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DonationAmbience } from "@/app/(shell)/(public)/(with-footer)/donate/_components/donation-ambience";
import { CardAura, HeroVisuals } from "@/components/home/hero-visuals";
import {
  MercadoPagoIcon,
  PayPalIcon,
} from "@/components/common/brand-icons";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { ProgressGrid } from "@/components/common/progress-grid";
import { FaqList } from "@/components/common/faq-list";
import AnimationWrapper from "@/components/common/animation-wrapper";
import { WithdrawalNotice } from "@/components/legal/withdrawal-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateDonation } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { errorToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/error";

type Frequency = "oneTime" | "monthly";
type Provider = "paypal" | "mercadopago";

const PRESET_TIERS = [15, 30, 60, 120] as const;

const FREQUENCY_OPTIONS = [
  { value: "oneTime", labelKey: "frequencyOneTime" },
  { value: "monthly", labelKey: "frequencyMonthly" },
] as const;

const IMPACT_STATS = [
  {
    valueKey: "stat1Value",
    labelKey: "stat1Label",
    Icon: Users,
    tone: "bg-primary/10 text-primary",
  },
  {
    valueKey: "stat2Value",
    labelKey: "stat2Label",
    Icon: Percent,
    tone: "bg-emerald-accent/10 text-emerald-accent",
  },
  {
    valueKey: "stat3Value",
    labelKey: "stat3Label",
    Icon: Activity,
    tone: "bg-cyan-glow/10 text-cyan-glow",
  },
] as const;

const FUND_ALLOCATION = [
  { labelKey: "fundServers", value: 45, tone: "primary" },
  { labelKey: "fundSafety", value: 30, tone: "emerald" },
  { labelKey: "fundProduct", value: 25, tone: "cyan" },
] as const;

const FAQ_ITEMS = [
  { value: "faq-1", questionKey: "faq1Q", answerKey: "faq1A" },
  { value: "faq-2", questionKey: "faq2Q", answerKey: "faq2A" },
  { value: "faq-3", questionKey: "faq3Q", answerKey: "faq3A" },
  { value: "faq-4", questionKey: "faq4Q", answerKey: "faq4A" },
] as const;

export default function DonatePage() {
  const t = useTranslations("DonateUs");
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { mutate: donate, isPending } = useCreateDonation();

  const [frequency, setFrequency] = useState<Frequency>("oneTime");
  const [selectedTier, setSelectedTier] = useState<number | null>(30);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);

  const handleSelectTier = (amount: number) => {
    setSelectedTier(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    const normalized = raw.replace(/(\..*)\./g, "$1");
    setCustomAmount(normalized);
    setSelectedTier(null);
  };

  const numericCustomAmount = Number(customAmount);
  const finalAmount =
    selectedTier ?? (numericCustomAmount > 0 ? numericCustomAmount : 0);
  const formattedAmount = finalAmount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  const handleDonate = (provider: Provider) => {
    if (finalAmount < 1) {
      errorToast(t("minAmountError"));
      return;
    }

    setPendingProvider(provider);
    donate(
      { amount: finalAmount, provider },
      {
        onError: (err) => {
          setPendingProvider(null);
          errorToast(
            getErrorMessage(
              err,
              "Failed to initiate checkout. Please try again.",
            ),
          );
        },
      },
    );
  };

  return (
    <div className="relative isolate min-h-screen">
      {/* Subtle top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-75 bg-linear-to-b from-primary/5 to-transparent"
      />

      {/* Full-page ambience */}
      <DonationAmbience />
      <HeroVisuals />

      {/* Hero */}
      <SectionWrapper
        padding="none"
        className="relative z-10 pt-12 pb-16 lg:pt-20 lg:pb-24"
      >
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <AnimationWrapper
            direction="up"
            duration={0.5}
            once
            className="lg:col-span-7"
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium tracking-widest text-primary uppercase backdrop-blur-sm">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                {t("pill")}
              </span>

              <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t("heroTitle")}{" "}
                <span className="text-primary">{t("heroTitleAccent")}</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-foreground/70 sm:text-lg">
                {t("heroSubtitle")}
              </p>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {IMPACT_STATS.map((stat, index) => {
                const Icon = stat.Icon;

                return (
                  <motion.div
                    key={stat.valueKey}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.45,
                      delay: 0.15 + index * 0.08,
                      ease: "easeOut",
                    }}
                    className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-md"
                  >
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg",
                        stat.tone,
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <p className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">
                      {t(stat.valueKey)}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-foreground/60">
                      {t(stat.labelKey)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </AnimationWrapper>

          {/* Donation card */}
          <AnimationWrapper
            direction="up"
            delay={0.1}
            duration={0.5}
            once
            className="lg:col-span-5"
          >
            <div className="relative">
              <CardAura />
              <Card id="donate" className="relative w-full">
                <CardContent>
                  {/* Frequency */}
                  <div
                    role="group"
                    aria-label={t("frequencyLabel")}
                    className="flex items-center gap-5 border-b border-border"
                  >
                    {FREQUENCY_OPTIONS.map((option) => {
                      const isActive = frequency === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => setFrequency(option.value)}
                          className={cn(
                            "-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                            isActive
                              ? "border-primary text-foreground"
                              : "border-transparent text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {t(option.labelKey)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Preset amounts */}
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {PRESET_TIERS.map((amount) => {
                      const isSelected = selectedTier === amount;

                      return (
                        <button
                          key={amount}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleSelectTier(amount)}
                          className={cn(
                            "rounded-lg border py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:bg-muted",
                          )}
                        >
                          ${amount}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom amount */}
                  <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-input px-3 py-2.5 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                    <span className="text-sm text-muted-foreground" aria-hidden>
                      $
                    </span>
                    <input
                      id="custom-amount"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      aria-label={t("customAmount")}
                      placeholder={t("customPlaceholder")}
                      value={customAmount}
                      onChange={handleCustomChange}
                      className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {t("summaryCurrency")}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">
                      {t("summaryTitle")}
                    </span>
                    <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
                      <motion.span
                        key={formattedAmount}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="inline-block"
                      >
                        ${formattedAmount}
                      </motion.span>
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {t("summaryCurrency")}
                        {frequency === "monthly" ? "/mo" : ""}
                      </span>
                    </span>
                  </div>

                  {/* Actions: If logged in, show payment gateways. If not, prompt to log in */}
                  {isAuthLoading ? (
                    <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-muted" />
                  ) : isAuthenticated ? (
                    <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Button
                        size="xl"
                        className="w-full"
                        disabled={finalAmount < 1 || isPending}
                        loading={isPending && pendingProvider === "paypal"}
                        loadingText={t("processing")}
                        onClick={() => handleDonate("paypal")}
                      >
                        <PayPalIcon className="size-4" />
                        {t("payWithPaypal")}
                      </Button>

                      <Button
                        variant="outline"
                        size="xl"
                        className="w-full"
                        disabled={finalAmount < 1 || isPending}
                        loading={isPending && pendingProvider === "mercadopago"}
                        loadingText={t("processing")}
                        onClick={() => handleDonate("mercadopago")}
                      >
                        <MercadoPagoIcon className="size-4" />
                        {t("payWithMercadopago")}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <Button
                        render={<Link href="/login?callbackUrl=/donate" />}
                        size="xl"
                        className="w-full"
                      >
                        <LogIn className="size-4" aria-hidden />
                        {t("loginToDonate")}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        {t("loginRequiredNotice")}
                      </p>
                    </div>
                  )}

                  <WithdrawalNotice className="mt-4" />

                  {/* Trust line */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Lock className="size-3 text-primary" aria-hidden />
                      {t("secureBadge")}
                    </span>
                    <span className="text-border" aria-hidden>
                      •
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ReceiptText
                        className="size-3 text-emerald-accent"
                        aria-hidden
                      />
                      {t("taxReceiptNotice")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimationWrapper>
        </div>
      </SectionWrapper>

      {/* Transparency */}
      <SectionWrapper padding="md" className="border-t border-border">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <AnimationWrapper
            direction="right"
            duration={0.5}
            once
            className="lg:col-span-4"
          >
            <SectionHeading
              eyebrow={t("fundsKicker")}
              title={t("fundsTitle")}
              description={t("fundsSubtitle")}
              alignment="left"
              as="h2"
              variant="plain"
              constrain={false}
              titleClassName="text-2xl font-bold sm:text-3xl"
              descriptionClassName="mt-3 max-w-sm text-sm leading-6"
            />
          </AnimationWrapper>

          <AnimationWrapper
            direction="up"
            delay={0.1}
            duration={0.5}
            once
            className="lg:col-span-8"
          >
            <ProgressGrid
              items={FUND_ALLOCATION.map((item) => ({
                label: t(item.labelKey),
                value: item.value,
                tone: item.tone,
              }))}
            />
          </AnimationWrapper>
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper padding="md" className="border-t border-border">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
          <AnimationWrapper
            direction="right"
            duration={0.5}
            once
            className="lg:col-span-4"
          >
            <SectionHeading
              title={t("faqTitle")}
              alignment="left"
              as="h2"
              variant="plain"
              constrain={false}
              titleClassName="text-2xl font-bold sm:text-3xl"
            />
          </AnimationWrapper>

          <AnimationWrapper
            direction="up"
            delay={0.1}
            duration={0.5}
            once
            className="lg:col-span-8"
          >
            <FaqList
              items={FAQ_ITEMS.map((item) => ({
                value: item.value,
                question: t(item.questionKey),
                answer: t(item.answerKey),
              }))}
            />
          </AnimationWrapper>
        </div>
      </SectionWrapper>
    </div>
  );
}
