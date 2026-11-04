import { apiClient } from "@/lib/api-client";
import type { ApiResponse, DonatePayload, DonateResponse } from "@/types";

/**
 * Create a donation checkout session (PayPal or MercadoPago)
 * Endpoint: POST /donate/donate
 */
export function createDonation(payload: DonatePayload) {
  return apiClient<ApiResponse<DonateResponse>>("/donate/donate", {
    method: "POST",
    body: payload,
  });
}

