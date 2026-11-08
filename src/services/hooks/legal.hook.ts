import { useMutation } from "@tanstack/react-query";

import type { ContactPayload, ConsumerRequestPayload } from "@/types";
import { createConsumerRequest, sendContactMessage } from "../api/legal.api";

export function useSendContactMessage() {
  return useMutation({
    mutationFn: (payload: ContactPayload) => sendContactMessage(payload),
  });
}

export function useCreateConsumerRequest() {
  return useMutation({
    mutationFn: (payload: ConsumerRequestPayload) => createConsumerRequest(payload),
  });
}
