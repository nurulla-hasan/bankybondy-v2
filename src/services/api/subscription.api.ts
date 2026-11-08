import { z } from "zod";

import { apiClient } from "@/lib/api-client";
import type { SubscribeInput, SubscribeResult, SubscriptionPrices } from "@/types";

const priceSchema = z.object({
  currency: z.string().regex(/^[A-Z]{3}$/),
  amount: z.number().positive(),
});

const pricesResponseSchema = z.object({
  data: z.object({
    plans: z.array(
      z.object({
        type: z.enum(["Free", "Standard", "Premium"]),
        bondLimit: z.number().int().nonnegative(),
        paypal: priceSchema.nullable(),
        mercadopago: priceSchema.extend({ usdBase: z.number().positive() }).nullable(),
      }),
    ),
    dollarRate: z.number().positive().nullable(),
  }),
});

// The browser is redirected to this URL, so only http(s) is accepted.
const subscribeResponseSchema = z.object({
  data: z.object({
    url: z.url({ protocol: /^https?$/ }),
  }),
});

/** GET /normal-user/subscription-prices — normalUser.services.ts:getSubscriptionPrices. */
export async function getSubscriptionPrices(): Promise<SubscriptionPrices> {
  const response = await apiClient<unknown>("/normal-user/subscription-prices", {
    method: "GET",
  });
  return pricesResponseSchema.parse(response).data;
}

/** POST /normal-user/subscribe — normalUser.services.ts:purchaseSubscription. */
export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  const response = await apiClient<unknown>("/normal-user/subscribe", {
    method: "POST",
    body: input,
  });
  return subscribeResponseSchema.parse(response).data;
}
