import { z } from "zod";

import { apiClient } from "@/lib/api-client";

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
