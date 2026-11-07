"use client";

import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaidSubscriptionPlan, SubscriptionPlan, SubscriptionPrice, SubscriptionProvider } from "@/types/subscription.types";

const LEVEL = { Free: 0, Standard: 1, Premium: 2 } as const;

export function PlanCard({
  plan,
  currentPlan,
  checkoutDisabled,
  providers,
  onCheckout,
}: {
  plan: SubscriptionPlan;
  currentPlan: SubscriptionPlan["type"];
  checkoutDisabled: boolean;
  providers: Record<SubscriptionProvider, boolean>;
  onCheckout: (plan: PaidSubscriptionPlan, provider: SubscriptionProvider) => void;
}) {
  const t = useTranslations("Subscription");
  const locale = useLocale();
  const current = plan.type === currentPlan;
  const included = LEVEL[plan.type] < LEVEL[currentPlan];
  const paidPlan = plan.type === "Free" ? null : plan.type;
  const price = (value: SubscriptionPrice) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: value.currency }).format(value.amount);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{t(`plan.${plan.type}`)}</CardTitle>
          {current ? (
            <Badge variant="secondary">{t("current")}</Badge>
          ) : included ? (
            <Badge variant="secondary">{t("included")}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 text-primary" aria-hidden />
            {t("bondLimit", { count: plan.bondLimit })}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
            {plan.type === "Free" ? t("free") : t("oneTime")}
          </p>
        </div>
      </CardContent>
      {paidPlan ? (
        <CardFooter>
          <div className="grid w-full gap-2">
            {(["paypal", "mercadopago"] as const).map((provider) => {
              const amount = plan[provider];
              return (
                <Button
                  key={provider}
                  variant={provider === "paypal" ? "default" : "outline"}
                  disabled={checkoutDisabled || current || included || !amount || !providers[provider]}
                  onClick={() => onCheckout(paidPlan, provider)}
                >
                  <CreditCard aria-hidden />
                  {amount
                    ? t(`${providers[provider] ? "pay" : "providerDisabled"}.${provider}`, { price: price(amount) })
                    : t(`providerUnavailable.${provider}`)}
                </Button>
              );
            })}
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
