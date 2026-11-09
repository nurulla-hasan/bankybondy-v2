import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  AddRatingInput,
  ApiResponse,
  BondLinkQueryParams,
  BondRequestQueryParams,
  CreateBondLinkInput,
  RawBondRequest,
  RawBondRequestList,
} from "@/types";
import type { CreateBondValues } from "@/validations";
import {
  addBondRating,
  createBondLink,
  createBondRequest,
  countMyBondRequests,
  deleteBondRequest,
  getBondMatches,
  getBondQuota,
  getBondRequestById,
  getMyBondLinks,
  getMyBondRequests,
  markAsCompleteBond,
  setBondRequestPaused,
} from "../api";
import { peopleKeys } from "./people.hook";

export const BOND_REQUESTS_PAGE_SIZE = 12;
export const BOND_LINKS_PAGE_SIZE = 12;
export const BOND_MATCHES_PAGE_SIZE = 10;
const MATCHES_POLL_MS = 3_000;

export const bondKeys = {
  all: ["bonds"] as const,
  requests: () => [...bondKeys.all, "requests"] as const,
  requestList: (params: BondRequestQueryParams) =>
    [...bondKeys.requests(), "list", params] as const,
  requestDetail: (id: string | null) =>
    [...bondKeys.requests(), "detail", id] as const,
  matches: () => [...bondKeys.all, "matches"] as const,
  links: () => [...bondKeys.all, "links"] as const,
  linkList: (params: BondLinkQueryParams) =>
    [...bondKeys.links(), params] as const,
  quota: () => [...bondKeys.all, "quota"] as const,
};

const normalizeRequestParams = (params: BondRequestQueryParams = {}) => ({
  page: params.page && params.page > 0 ? params.page : 1,
  limit: params.limit ?? BOND_REQUESTS_PAGE_SIZE,
  searchTerm: params.searchTerm?.trim() || undefined,
  sort: params.sort ?? "-createdAt",
  status: params.status,
});

const normalizeLinkParams = (params: BondLinkQueryParams = {}) => ({
  page: params.page && params.page > 0 ? params.page : 1,
  limit: params.limit ?? BOND_LINKS_PAGE_SIZE,
  searchTerm: params.searchTerm?.trim() || undefined,
  sort: params.sort ?? "-createdAt",
  status: params.status,
});

export function useBondRequests(params: BondRequestQueryParams = {}) {
  const normalized = normalizeRequestParams(params);

  return useQuery({
    queryKey: bondKeys.requestList(normalized),
    queryFn: () => getMyBondRequests(normalized),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

/** Slots used/left for the caller's plan, computed by the same filter the API enforces. */
export function useBondQuota() {
  return useQuery({
    queryKey: bondKeys.quota(),
    queryFn: getBondQuota,
    select: (response) => response.data,
    staleTime: 30 * 1000,
  });
}

/**
 * The profile hero's two bond numbers. Counted server-side per status with a
 * one-row page each, instead of pulling the whole list into the browser.
 */
export function useMyBondCounts() {
  return useQuery({
    queryKey: [...bondKeys.all, "counts"] as const,
    queryFn: async () => {
      const [ongoing, waiting, completed] = await Promise.all([
        countMyBondRequests("ONGOING"),
        countMyBondRequests("WAITING_FOR_LINK"),
        countMyBondRequests("COMPLETED"),
      ]);

      return { active: ongoing + waiting, completed };
    },
    staleTime: 30 * 1000,
  });
}

export function useBondRequest(id: string | null) {
  return useQuery({
    queryKey: bondKeys.requestDetail(id),
    queryFn: () => getBondRequestById(id as string),
    enabled: !!id,
    select: (response) => response.data,
    staleTime: 30 * 1000,
  });
}

export function useBondLinks(params: BondLinkQueryParams = {}) {
  const normalized = normalizeLinkParams(params);

  return useQuery({
    queryKey: bondKeys.linkList(normalized),
    queryFn: () => getMyBondLinks(normalized),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useBondMatches(requestId: string | null) {
  return useInfiniteQuery({
    queryKey: [...bondKeys.matches(), "infinite", requestId] as const,
    queryFn: ({ pageParam }) =>
      getBondMatches({
        bondRequest: requestId as string,
        page: pageParam,
        limit: BOND_MATCHES_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total, status } = lastPage.data;

      if (status === "computing") return undefined;

      return page * limit < total ? page + 1 : undefined;
    },
    enabled: !!requestId,
    staleTime: 10 * 1000,
    // El robot mantiene la cache fresca; el poll de abajo cubre "computing".
    // Un refetch por foco de ventana solo repetía una lectura ya resuelta.
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      query.state.data?.pages[0]?.data.status === "computing"
        ? MATCHES_POLL_MS
        : false,
  });
}

export function useCreateBondRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateBondValues) =>
      createBondRequest({
        offer: values.offer,
        want: values.want,
        description: values.description,
        modality: values.modality,
        radius:
          values.modality === "physical" ? values.radiusKm : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bondKeys.requests() });
      queryClient.invalidateQueries({ queryKey: bondKeys.quota() });
    },
  });
}

export function useCreateBondLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBondLinkInput) => createBondLink(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bondKeys.links() });
    },
  });
}

export function useMarkBondLinkComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bondLinkId: string) => markAsCompleteBond(bondLinkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bondKeys.links() });
    },
  });
}

export function useAddBondRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddRatingInput) => addBondRating(input),
    onSuccess: (_response, input) => {
      queryClient.invalidateQueries({ queryKey: bondKeys.links() });
      // The rated counterpart's public reviews/reputation changed.
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(input.userId) });
    },
  });
}

export function useToggleBondRequestPause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RawBondRequest) => {
      const response = await setBondRequestPaused(
        request._id,
        !request.isPause,
      );

      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<ApiResponse<RawBondRequestList>>(
        { queryKey: bondKeys.requests() },
        (response) =>
          response
            ? {
                ...response,
                data: {
                  ...response.data,
                  result: response.data.result.map((item) =>
                    item._id === updated._id
                      ? { ...item, isPause: updated.isPause }
                      : item,
                  ),
                },
              }
            : response,
      );
    },
  });
}

export function useDeleteBondRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RawBondRequest) => deleteBondRequest(request._id),
    onSuccess: (_response, request) => {
      queryClient.setQueriesData<ApiResponse<RawBondRequestList>>(
        { queryKey: bondKeys.requests() },
        (response) =>
          response
            ? {
                ...response,
                data: {
                  ...response.data,
                  meta: {
                    ...response.data.meta,
                    total: Math.max(response.data.meta.total - 1, 0),
                  },
                  result: response.data.result.filter(
                    (item) => item._id !== request._id,
                  ),
                },
              }
            : response,
      );
      queryClient.invalidateQueries({ queryKey: bondKeys.quota() });
    },
  });
}
