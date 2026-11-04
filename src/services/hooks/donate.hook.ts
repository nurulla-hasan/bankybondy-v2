import { useMutation } from "@tanstack/react-query";
import { createDonation } from "../api/donate.api";
import type { DonatePayload } from "@/types";

/**
 * Hook to initiate donation checkout
 */
export function useCreateDonation() {
  return useMutation({
    mutationFn: (payload: DonatePayload) => createDonation(payload),
    onSuccess: (res) => {
      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    },
  });
}

