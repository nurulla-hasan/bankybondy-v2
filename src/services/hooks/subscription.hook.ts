import { useMutation, useQuery } from "@tanstack/react-query";

import type { SubscribeInput } from "@/types";
import { getSubscriptionPrices, subscribe } from "../api/subscription.api";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  prices: () => [...subscriptionKeys.all, "prices"] as const,
};

export function useSubscriptionPrices() {
  return useQuery({
    queryKey: subscriptionKeys.prices(),
    queryFn: getSubscriptionPrices,
    staleTime: 5 * 60_000,
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: (input: SubscribeInput) => subscribe(input),
    onSuccess: (result) => {
      // Cross-origin navigation leaves this document alive for a moment; resetting
      // the pending state here would re-enable the buttons and allow a second order.
      window.location.assign(result.url);
    },
  });
}
