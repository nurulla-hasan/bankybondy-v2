import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  ApiResponse,
  BondLinkQueryParams,
  BondRequestQueryParams,
  CreateBondLinkInput,
  RawBondRequest,
  RawBondRequestList,
} from "@/types";
import type { CreateBondValues } from "@/validations";
import {
  createBondLink,
  createBondRequest,
  deleteBondRequest,
  getBondMatches,
  getBondRequestById,
  getMyBondLinks,
  getMyBondRequests,
  setBondRequestPaused,
} from "../api";

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
  matchList: (params: { bondRequest: string | null; page: number; limit: number }) =>
    [...bondKeys.matches(), params] as const,
  links: () => [...bondKeys.all, "links"] as const,
  linkList: (params: BondLinkQueryParams) =>
    [...bondKeys.links(), params] as const,
};

const normalizeRequestParams = (params: BondRequestQueryParams = {}) => ({
  page: params.page && params.page > 0 ? params.page : 1,
  limit: params.limit ?? BOND_REQUESTS_PAGE_SIZE,
  searchTerm: params.searchTerm?.trim() || undefined,
  sort: params.sort ?? "-createdAt",
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

export function useBondMatches(requestId: string | null, page = 1) {
  const normalizedPage = page > 0 ? page : 1;

  return useQuery({
    queryKey: bondKeys.matchList({
      bondRequest: requestId,
      page: normalizedPage,
      limit: BOND_MATCHES_PAGE_SIZE,
    }),
    queryFn: () =>
      getBondMatches({
        bondRequest: requestId as string,
        page: normalizedPage,
        limit: BOND_MATCHES_PAGE_SIZE,
      }),
    enabled: !!requestId,
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
    refetchInterval: (query) =>
      query.state.data?.data.status === "computing" ? MATCHES_POLL_MS : false,
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
    },
  });
}
