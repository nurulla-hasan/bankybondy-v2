"use client";

import { useQuery } from "@tanstack/react-query";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubscriptionPrices } from "@/services/api/subscription.api";
import { useMyProfile } from "@/services/hooks/profile.hook";
import type { PaidSubscriptionPlan, SubscriptionPlanType, SubscriptionProvider } from "@/types/subscription.types";

import { PlanCard } from "./plan-card";

export function SubscriptionPlans({
  checkoutDisabled,
  providers,
  onCheckout,
}: {
  checkoutDisabled: boolean;
  providers: Record<SubscriptionProvider, boolean>;
  onCheckout: (plan: PaidSubscriptionPlan, provider: SubscriptionProvider) => void;
}) {
  const t = useTranslations("Subscription");
  const prices = useQuery({
    queryKey: ["subscription", "prices"],
    queryFn: getSubscriptionPrices,
    staleTime: 60_000,
  });
  const profile = useMyProfile();
  const planType = profile.data?.subscriptionType ?? "Free";
  const isKnownPlan = planType === "Free" || planType === "Standard" || planType === "Premium";

  if (prices.isPending || profile.isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-3" aria-hidden>
        {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-64 rounded-xl" />)}
      </div>
    );
  }

  if (prices.isError || profile.isError || !isKnownPlan) {
    return (
      <EmptyState
        icon={<WifiOff className="size-5" aria-hidden />}
        title={t("loadErrorTitle")}
        description={t("loadErrorDescription")}
        action={<Button variant="outline" onClick={() => { void prices.refetch(); void profile.refetch(); }}>{t("retry")}</Button>}
      />
    );
  }

  return (
    <section aria-label={t("availablePlans")} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("currentPlan")}: <strong className="text-foreground">{t(`plan.${planType}`)}</strong>
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {prices.data.plans.map((plan) => (
          <PlanCard
            key={plan.type}
            plan={plan}
            currentPlan={planType as SubscriptionPlanType}
            checkoutDisabled={checkoutDisabled}
            providers={providers}
            onCheckout={onCheckout}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{t("priceNotice")}</p>
    </section>
  );
}
