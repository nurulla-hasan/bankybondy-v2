import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  ApiResponse,
  PeopleQueryParams,
  PersonBondsQueryParams,
  PersonRatingsQueryParams,
  RawPersonProfile,
  ReportUserInput,
  SendFriendRequestInput,
  UpdateLocationInput,
} from "@/types";
import {
  blockUser,
  getPeople,
  getPerson,
  getPersonBonds,
  getPersonRatings,
  reportUser,
  sendFriendRequest,
  updateMyLocation,
} from "../api";

export const PEOPLE_PAGE_SIZE = 12;
export const PERSON_BONDS_PAGE_SIZE = 6;
export const PERSON_RATINGS_PAGE_SIZE = 5;

export const peopleKeys = {
  all: ["people"] as const,
  lists: () => [...peopleKeys.all, "list"] as const,
  list: (params: PeopleQueryParams) =>
    [...peopleKeys.lists(), params] as const,
  details: () => [...peopleKeys.all, "detail"] as const,
  detail: (id: string) => [...peopleKeys.details(), id] as const,
  bonds: (id: string, params: PersonBondsQueryParams) =>
    [...peopleKeys.detail(id), "bonds", params] as const,
  ratings: (id: string, params: PersonRatingsQueryParams) =>
    [...peopleKeys.detail(id), "ratings", params] as const,
};

const normalizePeopleParams = (params: PeopleQueryParams = {}) => {
  const near = params.near === "true";

  return {
    page: params.page && params.page > 0 ? params.page : 1,
    limit: params.limit ?? PEOPLE_PAGE_SIZE,
    searchTerm: params.searchTerm?.trim() || undefined,
    online: params.online === "true" ? ("true" as const) : undefined,
    near: near ? ("true" as const) : undefined,
    // The backend gives near precedence over sort, so don't send both.
    sort: near ? undefined : params.sort,
  };
};

const normalizeBondParams = (params: PersonBondsQueryParams = {}) => ({
  page: params.page && params.page > 0 ? params.page : 1,
  limit: params.limit ?? PERSON_BONDS_PAGE_SIZE,
  searchTerm: params.searchTerm?.trim() || undefined,
});

const normalizeRatingParams = (params: PersonRatingsQueryParams = {}) => ({
  page: params.page && params.page > 0 ? params.page : 1,
  limit: params.limit ?? PERSON_RATINGS_PAGE_SIZE,
});

export function usePeople(params: PeopleQueryParams = {}) {
  const normalized = normalizePeopleParams(params);

  return useQuery({
    queryKey: peopleKeys.list(normalized),
    queryFn: () => getPeople(normalized),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function usePerson(id: string | null) {
  return useQuery({
    queryKey: peopleKeys.detail(id ?? ""),
    queryFn: () => getPerson(id as string),
    enabled: !!id,
    select: (response) => response.data,
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function usePersonBonds(
  id: string | null,
  params: PersonBondsQueryParams = {},
) {
  const normalized = normalizeBondParams(params);

  return useQuery({
    queryKey: peopleKeys.bonds(id ?? "", normalized),
    queryFn: () => getPersonBonds(id as string, normalized),
    enabled: !!id,
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function usePersonRatings(
  id: string | null,
  params: PersonRatingsQueryParams = {},
) {
  const normalized = normalizeRatingParams(params);

  return useQuery({
    queryKey: peopleKeys.ratings(id ?? "", normalized),
    queryFn: () => getPersonRatings(id as string, normalized),
    enabled: !!id,
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendFriendRequestInput) => sendFriendRequest(input),
    onSuccess: (_response, input) => {
      queryClient.setQueryData<ApiResponse<RawPersonProfile>>(
        peopleKeys.detail(input.receiver),
        (response) =>
          response
            ? {
                ...response,
                data: {
                  ...response.data,
                  friendRequestStatus: "following",
                },
              }
            : response,
      );
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blockUser(id),
    onSuccess: (_response, id) => {
      queryClient.removeQueries({ queryKey: peopleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
    },
  });
}

export function useReportUser() {
  return useMutation({
    mutationFn: (input: ReportUserInput) => reportUser(input),
  });
}

export function useUpdateMyLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateLocationInput) => updateMyLocation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
    },
  });
}
