"use client";

import {
  Check,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Star,
  Trophy,
  User,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { MercadoPagoIcon, PayPalIcon } from "@/components/common/brand-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  PaidSubscriptionPlan,
  SubscriptionPlan,
  SubscriptionPlanType,
  SubscriptionPrice,
  SubscriptionProvider,
} from "@/types";

const LEVEL: Record<SubscriptionPlanType, number> = {
  Free: 0,
  Standard: 1,
  Premium: 2,
};

const PLAN_ICON = {
  Free: User,
  Standard: Star,
  Premium: Trophy,
} as const;

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan: SubscriptionPlanType;
  checkoutDisabled: boolean;
  pending: { plan: PaidSubscriptionPlan; provider: SubscriptionProvider } | null;
  onCheckout: (
    plan: PaidSubscriptionPlan,
    provider: SubscriptionProvider,
  ) => void;
}

export function PlanCard({
  plan,
  currentPlan,
  checkoutDisabled,
  pending,
  onCheckout,
}: PlanCardProps) {
  const t = useTranslations("Subscription");
  const locale = useLocale();
  const current = plan.type === currentPlan;
  const included = LEVEL[plan.type] < LEVEL[currentPlan];
  const paidPlan = plan.type === "Free" ? null : plan.type;
  const Icon = PLAN_ICON[plan.type];

  // Prices are display-only: the backend computes what is actually charged.
  const formatPrice = (price: SubscriptionPrice) =>
    new Intl.NumberFormat(price.currency === "ARS" ? "es-AR" : locale, {
      style: "currency",
      currency: price.currency,
      maximumFractionDigits: 0,
    }).format(price.amount);

  const loadingProvider =
    pending && pending.plan === paidPlan ? pending.provider : null;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden />
            </span>
            <CardTitle>{t(`plan.${plan.type}`)}</CardTitle>
          </div>
          {current ? (
            <Badge variant="secondary">{t("current")}</Badge>
          ) : included ? (
            <Badge variant="secondary">{t("included")}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <ul role="list" className="space-y-3">
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <span>{t("bondLimit", { count: plan.bondLimit })}</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <span>{plan.type === "Free" ? t("free") : t("oneTime")}</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            {plan.type === "Free" ? (
              <CreditCard
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
            ) : (
              <RefreshCw
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
            )}
            <span>
              {plan.type === "Free" ? t("noCard") : t("trustNoRenewal")}
            </span>
          </li>
        </ul>
      </CardContent>
      {paidPlan ? (
        <CardFooter>
          {current || included ? (
            <Button variant="secondary" className="w-full" disabled>
              {current ? t("current") : t("included")}
            </Button>
          ) : (
            <div className="grid w-full gap-2">
              <Button
                variant="default"
                className="w-full"
                disabled={checkoutDisabled || !plan.paypal}
                loading={loadingProvider === "paypal"}
                loadingText={t("redirecting")}
                onClick={() => onCheckout(paidPlan, "paypal")}
              >
                <PayPalIcon className="size-4" aria-hidden />
                {plan.paypal
                  ? t("pay.paypal", { price: formatPrice(plan.paypal) })
                  : t("unavailable")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={checkoutDisabled || !plan.mercadopago}
                loading={loadingProvider === "mercadopago"}
                loadingText={t("redirecting")}
                onClick={() => onCheckout(paidPlan, "mercadopago")}
              >
                <MercadoPagoIcon className="size-4" aria-hidden />
                {plan.mercadopago
                  ? t("pay.mercadopago", {
                      price: formatPrice(plan.mercadopago),
                    })
                  : t("unavailable")}
              </Button>
            </div>
          )}
        </CardFooter>
      ) : null}
    </Card>
  );
}
