import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ContactPayload,
  ContactResponse,
  ConsumerRequestPayload,
  ConsumerRequestResult,
} from "@/types";

/** POST /contact-us — root mount, rewritten from `/api/v1` in the browser. */
export function sendContactMessage(payload: ContactPayload) {
  return apiClient<ContactResponse>("/contact-us", {
    method: "POST",
    body: payload,
  });
}

/** POST /consumidor/solicitud — public consumer-rights request (no login). */
export function createConsumerRequest(payload: ConsumerRequestPayload) {
  return apiClient<ApiResponse<ConsumerRequestResult>>("/consumidor/solicitud", {
    method: "POST",
    body: payload,
  });
}
