import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  mockBondLinks,
  mockBondMatches,
  mockBondRequests,
} from "@/mocks/bonds.mock";
import type { BondMatch, BondRequest } from "@/types";
import type { CreateBondValues } from "@/validations";

export const bondKeys = {
  all: ["bonds"] as const,
  requests: () => [...bondKeys.all, "requests"] as const,
  matches: () => [...bondKeys.all, "matches"] as const,
  links: () => [...bondKeys.all, "links"] as const,
};

// Mock-backed until the bond endpoints are wired up. Cache stays warm so the
// page and the dialogs read/write the same source of truth.
export function useBondRequests() {
  return useQuery({
    queryKey: bondKeys.requests(),
    queryFn: async () => mockBondRequests,
    initialData: mockBondRequests,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useBondMatches() {
  return useQuery({
    queryKey: bondKeys.matches(),
    queryFn: async () => mockBondMatches,
    initialData: mockBondMatches,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useBondLinks() {
  return useQuery({
    queryKey: bondKeys.links(),
    queryFn: async () => mockBondLinks,
    initialData: mockBondLinks,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useCreateBondRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateBondValues): Promise<BondRequest> => ({
      id: `req-${Date.now()}`,
      offer: values.offer,
      want: values.want,
      description: values.description,
      modality: values.modality,
      radiusKm: values.modality === "physical" ? values.radiusKm : undefined,
      status: "waiting",
      createdAt: new Date().toISOString(),
      matchCount: 0,
    }),
    onSuccess: (request) => {
      queryClient.setQueryData<BondRequest[]>(
        bondKeys.requests(),
        (previous = []) => [request, ...previous],
      );
    },
  });
}

export function useToggleBondRequestPause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BondRequest): Promise<BondRequest> => ({
      ...request,
      status: request.status === "paused" ? "waiting" : "paused",
    }),
    onSuccess: (updated) => {
      queryClient.setQueryData<BondRequest[]>(
        bondKeys.requests(),
        (previous = []) =>
          previous.map((item) => (item.id === updated.id ? updated : item)),
      );
    },
  });
}

export function useDeleteBondRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BondRequest) => request,
    onSuccess: (request) => {
      queryClient.setQueryData<BondRequest[]>(
        bondKeys.requests(),
        (previous = []) => previous.filter((item) => item.id !== request.id),
      );
      queryClient.setQueryData<BondMatch[]>(
        bondKeys.matches(),
        (previous = []) =>
          previous.filter((match) => match.requestId !== request.id),
      );
    },
  });
}
