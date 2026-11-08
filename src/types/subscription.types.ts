/** Mirrors `ENUM_SUBSCRIPTION_TYPE` in the backend (`normalUser.enum.ts`). */
export type SubscriptionPlanType = "Free" | "Standard" | "Premium";

/** Only paid plans can be checked out; the backend rejects `Free`. */
export type PaidSubscriptionPlan = Exclude<SubscriptionPlanType, "Free">;

export type SubscriptionProvider = "paypal" | "mercadopago";

export interface SubscriptionPrice {
  currency: string;
  amount: number;
}

/** MercadoPago prices also carry the USD target they were converted from. */
export interface MercadoPagoPrice extends SubscriptionPrice {
  usdBase: number;
}

export interface SubscriptionPlan {
  type: SubscriptionPlanType;
  bondLimit: number;
  paypal: SubscriptionPrice | null;
  mercadopago: MercadoPagoPrice | null;
}

/** `GET /normal-user/subscription-prices` — the server is the only price source. */
export interface SubscriptionPrices {
  plans: SubscriptionPlan[];
  dollarRate: number | null;
}

/** `POST /normal-user/subscribe` body (`normalUser.validation.ts:48-53`). */
export interface SubscribeInput {
  type: PaidSubscriptionPlan;
  provider: SubscriptionProvider;
}

/** Provider checkout URL the browser must be redirected to. */
export interface SubscribeResult {
  url: string;
}
