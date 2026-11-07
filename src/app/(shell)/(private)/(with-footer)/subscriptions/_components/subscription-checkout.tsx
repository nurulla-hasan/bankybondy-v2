"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { getSubscriptionCheckout, startSubscriptionCheckout } from "@/services/api/subscription.api";
import type { PaidSubscriptionPlan, SubscriptionProvider } from "@/types/subscription.types";

import { SubscriptionPlans } from "./subscription-plans";

export function SubscriptionCheckout() {
  const t = useTranslations("Subscription");
  const queryClient = useQueryClient();
  const [uncertain, setUncertain] = useState(false);
  const [starting, setStarting] = useState(false);
  const startingRef = useRef(false);
  const previousCheckoutAt = useRef<string | null>(null);
  const refreshedConfirmation = useRef<string | null>(null);
  const checkout = useQuery({
    queryKey: ["subscription", "checkout"],
    queryFn: getSubscriptionCheckout,
    retry: false,
    refetchOnWindowFocus: "always",
    refetchInterval: (query) => {
      const status = query.state.data?.checkout?.status;
      return status === "creating" || status === "awaiting_confirmation" ? 5000 : false;
    },
  });
  const status = checkout.data?.checkout?.status;
  const confirmedAt = status === "confirmed" ? checkout.data?.checkout?.createdAt : undefined;

  useEffect(() => {
    if (!confirmedAt || refreshedConfirmation.current === confirmedAt) return;
    refreshedConfirmation.current = confirmedAt;
    void queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    void queryClient.invalidateQueries({ queryKey: ["people", "detail"] });
  }, [confirmedAt, queryClient]);

  const refresh = async () => {
    const result = await checkout.refetch();
    if ((result.data?.checkout?.status === "confirmed" || result.data?.checkout?.status === "failed") &&
        result.data.checkout.createdAt !== previousCheckoutAt.current) setUncertain(false);
  };

  const handleCheckout = async (plan: PaidSubscriptionPlan, provider: SubscriptionProvider) => {
    if (startingRef.current || uncertain || !checkout.data || checkout.data.checkoutBlocked) return;
    startingRef.current = true;
    previousCheckoutAt.current = checkout.data.checkout?.createdAt ?? null;
    setStarting(true);
    try {
      const url = await startSubscriptionCheckout(plan, provider);
      window.location.assign(url);
    } catch {
      setUncertain(true);
      startingRef.current = false;
      setStarting(false);
      void checkout.refetch();
    }
  };

  const message = checkout.isPending ? t("statusChecking")
    : checkout.isError ? t("statusError")
    : uncertain ? t("statusUnknown")
    : status === "confirmed" ? t("statusConfirmed")
    : status === "failed" ? t("statusFailed")
    : status === "paid_needs_review" ? t("statusReview")
    : status === "creating" || status === "awaiting_confirmation" ? t("statusPending")
    : checkout.data?.checkoutBlocked ? t("statusUnavailable") : null;
  const disabled = starting || uncertain || checkout.isPending || checkout.isError || !checkout.data || checkout.data.checkoutBlocked;

  return (
    <div className="space-y-6">
      {message ? (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted p-4">
          <p className="text-sm text-foreground">{message}</p>
          {!checkout.isPending ? <Button variant="outline" onClick={() => void refresh()}>{t("refreshStatus")}</Button> : null}
        </div>
      ) : null}
      <SubscriptionPlans
        checkoutDisabled={disabled}
        providers={checkout.data?.providers ?? { paypal: false, mercadopago: false }}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
