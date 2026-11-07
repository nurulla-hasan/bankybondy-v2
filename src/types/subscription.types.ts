export type SubscriptionPlanType = "Free" | "Standard" | "Premium";
export type PaidSubscriptionPlan = Exclude<SubscriptionPlanType, "Free">;
export type SubscriptionProvider = "paypal" | "mercadopago";

export interface SubscriptionPrice {
  currency: string;
  amount: number;
}

export interface SubscriptionPlan {
  type: SubscriptionPlanType;
  bondLimit: number;
  paypal: SubscriptionPrice | null;
  mercadopago: (SubscriptionPrice & { usdBase: number }) | null;
}

export interface SubscriptionPrices {
  plans: SubscriptionPlan[];
  dollarRate: number | null;
}
