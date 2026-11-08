"use client";

import { useState } from "react";
import { Check, Lock, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getErrorMessage,
  isCheckoutInProgressError,
  isPlanAlreadyOwnedError,
} from "@/lib/error";
import { errorToast } from "@/lib/toast";
import { useMyProfile } from "@/services";
import {
  useSubscribe,
  useSubscriptionPrices,
} from "@/services/hooks/subscription.hook";
import type {
  PaidSubscriptionPlan,
  SubscriptionPlanType,
  SubscriptionProvider,
} from "@/types";

import { PlanCard } from "./plan-card";

const KNOWN_PLANS: SubscriptionPlanType[] = ["Free", "Standard", "Premium"];

interface PendingCheckout {
  plan: PaidSubscriptionPlan;
  provider: SubscriptionProvider;
}

export function SubscriptionContent() {
  const t = useTranslations("Subscription");
  const prices = useSubscriptionPrices();
  const profile = useMyProfile();
  const subscribe = useSubscribe();
  const [pending, setPending] = useState<PendingCheckout | null>(null);

  const handleCheckout = (
    plan: PaidSubscriptionPlan,
    provider: SubscriptionProvider,
  ) => {
    setPending({ plan, provider });
    subscribe.mutate(
      { type: plan, provider },
      {
        onError: (error) => {
          setPending(null);
          if (isCheckoutInProgressError(error)) {
            errorToast(t("checkoutInProgressTitle"), t("checkoutInProgress"));
            return;
          }
          if (isPlanAlreadyOwnedError(error)) {
            errorToast(t("alreadyOwnedTitle"), t("alreadyOwned"));
            // The cached profile still shows the old plan; refresh both layers.
            void profile.refetch();
            return;
          }
          errorToast(
            t("checkoutErrorTitle"),
            getErrorMessage(error, t("checkoutError")),
          );
        },
      },
    );
  };

  if (prices.isPending || profile.isPending) {
    return (
      <div className="space-y-4" aria-hidden>
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (prices.isError || profile.isError || !prices.data || !profile.data) {
    return (
      <EmptyState
        icon={<WifiOff className="size-5" aria-hidden />}
        title={t("loadErrorTitle")}
        description={t("loadErrorDescription")}
        action={
          <Button
            variant="outline"
            onClick={() => {
              void prices.refetch();
              void profile.refetch();
            }}
          >
            {t("retry")}
          </Button>
        }
      />
    );
  }

  const rawPlan = profile.data.subscriptionType as SubscriptionPlanType;
  const currentPlan: SubscriptionPlanType = KNOWN_PLANS.includes(rawPlan)
    ? rawPlan
    : "Free";
  const currentBondLimit =
    profile.data.bondLimit ??
    prices.data.plans.find((plan) => plan.type === currentPlan)?.bondLimit ??
    0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            {t("currentPlan")}
            <Badge variant="info">{t(`plan.${currentPlan}`)}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 text-primary" aria-hidden />
            {t("bondLimit", { count: currentBondLimit })}
          </p>
          <p className="text-sm text-muted-foreground">{t("currentPlanNote")}</p>
        </CardContent>
      </Card>

      <section aria-label={t("availablePlans")} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {prices.data.plans.map((plan) => (
            <PlanCard
              key={plan.type}
              plan={plan}
              currentPlan={currentPlan}
              checkoutDisabled={subscribe.isPending}
              pending={pending}
              onCheckout={handleCheckout}
            />
          ))}
        </div>
      </section>

      <div className="space-y-2 text-sm leading-6 text-muted-foreground">
        <p>{t("bondCountNote")}</p>
        <p>{t("priceNotice")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="size-3.5 text-primary" aria-hidden />
          {t("trustSecure")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          {t("trustOneTime")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <RefreshCw className="size-3.5 text-primary" aria-hidden />
          {t("trustNoRenewal")}
        </span>
      </div>
    </div>
  );
}
