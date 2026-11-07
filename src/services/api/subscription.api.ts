import { z } from "zod";

import { apiClient } from "@/lib/api-client";
import type { PaidSubscriptionPlan, SubscriptionProvider } from "@/types/subscription.types";

const priceSchema = z.object({
  currency: z.string().regex(/^[A-Z]{3}$/),
  amount: z.number().positive(),
});

const pricesResponseSchema = z.object({
  data: z.object({
    plans: z.array(z.object({
      type: z.enum(["Free", "Standard", "Premium"]),
      bondLimit: z.number().int().positive(),
      paypal: priceSchema.nullable(),
      mercadopago: priceSchema.extend({ usdBase: z.number().positive() }).nullable(),
    })),
    dollarRate: z.number().positive().nullable(),
  }),
});

/** GET /normal-user/subscription-prices — normalUser.services.ts:getSubscriptionPrices. */
export async function getSubscriptionPrices() {
  const response = await apiClient<unknown>("/normal-user/subscription-prices", {
    method: "GET",
  });
  return pricesResponseSchema.parse(response).data;
}

const checkoutResponseSchema = z.object({
  data: z.object({
    checkoutBlocked: z.boolean(),
    providers: z.object({ paypal: z.boolean(), mercadopago: z.boolean() }),
    checkout: z.object({
      plan: z.enum(["Standard", "Premium"]),
      provider: z.literal("paypal"),
      status: z.enum(["creating", "awaiting_confirmation", "confirmed", "paid_needs_review", "failed"]),
      createdAt: z.string(),
    }).nullable(),
  }),
});

export async function getSubscriptionCheckout() {
  const response = await apiClient<unknown>("/normal-user/subscription-checkout", { method: "GET" });
  return checkoutResponseSchema.parse(response).data;
}

export async function startSubscriptionCheckout(type: PaidSubscriptionPlan, provider: SubscriptionProvider) {
  const response = await apiClient<unknown>("/normal-user/subscribe", {
    method: "POST",
    body: { type, provider },
  });
  const { data } = z.object({ data: z.object({ url: z.url() }) }).parse(response);
  const url = new URL(data.url);
  const allowedHosts = new Set(["www.paypal.com", "www.sandbox.paypal.com"]);
  if (url.protocol !== "https:" || url.username || url.password || !allowedHosts.has(url.hostname)) {
    throw new Error("Unexpected checkout URL");
  }
  return url.href;
}
