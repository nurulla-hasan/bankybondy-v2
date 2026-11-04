"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CreditCard, Lock, LogIn, ReceiptText, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { StatStrip } from "@/components/common/stat-strip";
import { ProgressGrid } from "@/components/common/progress-grid";
import { FaqList } from "@/components/common/faq-list";
import AnimationWrapper from "@/components/common/animation-wrapper";
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
  { valueKey: "stat1Value", labelKey: "stat1Label" },
  { valueKey: "stat2Value", labelKey: "stat2Label" },
  { valueKey: "stat3Value", labelKey: "stat3Label" },
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
              "Failed to initiate checkout. Please try again."
            )
          );
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Subtle top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-75 bg-linear-to-b from-primary/5 to-transparent"
      />

      {/* Hero */}
      <SectionWrapper
        padding="none"
        className="relative z-10 pt-12 pb-16 lg:pt-20 lg:pb-24"
      >
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <AnimationWrapper
            direction="up"
            duration={0.5}
            once
            className="lg:col-span-7"
          >
            <SectionHeading
              eyebrow={t("pill")}
              title={
                <>
                  {t("heroTitle")}{" "}
                  <span className="text-primary">{t("heroTitleAccent")}</span>
                </>
              }
              description={t("heroSubtitle")}
              alignment="left"
              as="h1"
              variant="plain"
              constrain={false}
              titleClassName="max-w-2xl text-4xl font-bold sm:text-5xl lg:text-6xl"
              descriptionClassName="mt-5 max-w-xl text-base leading-7 sm:text-lg"
            />

            <StatStrip
              items={IMPACT_STATS.map((stat) => ({
                value: t(stat.valueKey),
                label: t(stat.labelKey),
              }))}
              className="mt-8 max-w-md"
            />
          </AnimationWrapper>

          {/* Donation card */}
          <AnimationWrapper
            direction="up"
            delay={0.1}
            duration={0.5}
            once
            className="lg:col-span-5"
          >
            <Card id="donate" className="w-full">
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
                            : "border-transparent text-muted-foreground hover:text-foreground"
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
                          "rounded-lg border py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground hover:bg-muted"
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
                    ${formattedAmount}
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
                      <Wallet className="size-4" aria-hidden />
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
                      <CreditCard className="size-4" aria-hidden />
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
          </AnimationWrapper>
        </div>
      </SectionWrapper>

      {/* Transparency */}
      <SectionWrapper padding="md" className="border-t border-border">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
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
          </div>

          <ProgressGrid
            items={FUND_ALLOCATION.map((item) => ({
              label: t(item.labelKey),
              value: item.value,
              tone: item.tone,
            }))}
            className="lg:col-span-8"
          />
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper padding="md" className="border-t border-border">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading
              title={t("faqTitle")}
              alignment="left"
              as="h2"
              variant="plain"
              constrain={false}
              titleClassName="text-2xl font-bold sm:text-3xl"
            />
          </div>

          <div className="lg:col-span-8">
            <FaqList
              items={FAQ_ITEMS.map((item) => ({
                value: item.value,
                question: t(item.questionKey),
                answer: t(item.answerKey),
              }))}
            />
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
