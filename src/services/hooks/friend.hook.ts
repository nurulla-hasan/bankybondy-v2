import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  FriendDecision,
  FriendListKind,
  FriendListQueryParams,
} from "@/types";
import { peopleKeys } from "./people.hook";
import {
  cancelFriendRequest,
  getFriends,
  getIncomingRequests,
  getPendingFriendCount,
  getSentRequests,
  respondFriendRequest,
  unfriendUser,
} from "../api";

export const FRIEND_PAGE_SIZE = 12;

export const friendKeys = {
  all: ["friend"] as const,
  lists: () => [...friendKeys.all, "list"] as const,
  list: (kind: FriendListKind, params: FriendListQueryParams) =>
    [...friendKeys.lists(), kind, params] as const,
  pendingCount: () => [...friendKeys.all, "pending-count"] as const,
};

const FRIEND_LIST_QUERY = {
  requests: getIncomingRequests,
  sent: getSentRequests,
  friends: getFriends,
} as const;

const normalizeFriendParams = (params: FriendListQueryParams = {}) => ({
  page: params.page && params.page > 0 ? params.page : 1,
  limit: params.limit ?? FRIEND_PAGE_SIZE,
  searchTerm: params.searchTerm?.trim() || undefined,
});

export function useFriendList(kind: FriendListKind, params: FriendListQueryParams = {}) {
  const normalized = normalizeFriendParams(params);

  return useQuery({
    queryKey: friendKeys.list(kind, normalized),
    queryFn: () => FRIEND_LIST_QUERY[kind](normalized),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function usePendingFriendRequestCount() {
  return useQuery({
    queryKey: friendKeys.pendingCount(),
    queryFn: getPendingFriendCount,
    select: (response) => response.data.count,
    staleTime: 30 * 1000,
  });
}

/**
 * `personId` is only here so the other party's profile cache refreshes — the
 * request itself is keyed by `requestId` (the FriendRequest `_id`).
 */
interface RespondVariables {
  requestId: string;
  decision: FriendDecision;
  personId: string;
}

export function useRespondFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, decision }: RespondVariables) =>
      respondFriendRequest(requestId, decision),
    onSuccess: (_response, { personId }) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
      queryClient.invalidateQueries({ queryKey: friendKeys.pendingCount() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(personId) });
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiverId: string) => cancelFriendRequest(receiverId),
    onSuccess: (_response, receiverId) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(receiverId) });
    },
  });
}

export function useUnfriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId: string) => unfriendUser(friendId),
    onSuccess: (_response, friendId) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(friendId) });
    },
  });
}
