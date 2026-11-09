import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/types";
import type {
  NotificationListResult,
  NotificationPreferences,
  NotificationQueryParams,
  UnseenNotificationResult,
} from "@/types";
import {
  deleteNotification,
  getNotificationPreferences,
  getNotifications,
  getUnseenNotificationCount,
  seeNotifications,
  seeOneNotification,
  updateNotificationPreferences,
} from "../api/notification.api";

export const notificationKeys = {
  all: ["notifications"] as const,
  unseen: () => [...notificationKeys.all, "unseen"] as const,
  list: (params: NotificationQueryParams) =>
    [...notificationKeys.all, "list", params] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

/**
 * Bell badge. Polling keeps it fresh without a socket connection (auth token is
 * HttpOnly, so it can't be sent in a socket handshake from the browser).
 */
export function useUnseenNotificationCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unseen(),
    queryFn: getUnseenNotificationCount,
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Notification list. Fetched lazily when the bell opens.
 */
export function useNotifications(
  params: NotificationQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Mark all notifications as seen (optimistically clears the badge).
 */
export function useSeeNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seeNotifications,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.unseen() });
      const previous = queryClient.getQueryData<
        ApiResponse<UnseenNotificationResult>
      >(notificationKeys.unseen());

      if (previous) {
        queryClient.setQueryData<ApiResponse<UnseenNotificationResult>>(
          notificationKeys.unseen(),
          {
            ...previous,
            data: { ...previous.data, unseenCount: 0 },
          }
        );
      }

      queryClient.setQueriesData<ApiResponse<NotificationListResult>>(
        { queryKey: [...notificationKeys.all, "list"] },
        (old) =>
          old
            ? {
                ...old,
                data: {
                  ...old.data,
                  result: old.data.result.map((item) => ({
                    ...item,
                    seen: true,
                  })),
                },
              }
            : old
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.unseen(),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unseen() });
      queryClient.invalidateQueries({
        queryKey: [...notificationKeys.all, "list"],
      });
    },
  });
}

/**
 * Mark a single notification as seen (optimistically decrements the badge).
 */
export function useSeeOneNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seeOneNotification,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.unseen() });
      const previous = queryClient.getQueryData<
        ApiResponse<UnseenNotificationResult>
      >(notificationKeys.unseen());

      if (previous) {
        queryClient.setQueryData<ApiResponse<UnseenNotificationResult>>(
          notificationKeys.unseen(),
          {
            ...previous,
            data: {
              ...previous.data,
              unseenCount: Math.max(0, previous.data.unseenCount - 1),
            },
          }
        );
      }

      queryClient.setQueriesData<ApiResponse<NotificationListResult>>(
        { queryKey: [...notificationKeys.all, "list"] },
        (old) =>
          old
            ? {
                ...old,
                data: {
                  ...old.data,
                  result: old.data.result.map((item) =>
                    item._id === id ? { ...item, seen: true } : item
                  ),
                },
              }
            : old
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.unseen(),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unseen() });
      queryClient.invalidateQueries({
        queryKey: [...notificationKeys.all, "list"],
      });
    },
  });
}

/**
 * Delete a notification (optimistically removes it from every cached list).
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: [...notificationKeys.all, "list"],
      });

      const previousLists = queryClient.getQueriesData<
        ApiResponse<NotificationListResult>
      >({ queryKey: [...notificationKeys.all, "list"] });

      queryClient.setQueriesData<ApiResponse<NotificationListResult>>(
        { queryKey: [...notificationKeys.all, "list"] },
        (old) => {
          if (!old) return old;
          const result = old.data.result.filter((item) => item._id !== id);
          return {
            ...old,
            data: {
              ...old.data,
              result,
              meta: {
                ...old.data.meta,
                total: Math.max(0, old.data.meta.total - 1),
              },
            },
          };
        }
      );

      return { previousLists };
    },
    onError: (_error, _id, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...notificationKeys.all, "list"],
      });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unseen() });
    },
  });
}

/**
 * Muted categories (fetched when the settings view opens).
 */
export function useNotificationPreferences(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: getNotificationPreferences,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Save the full muted categories set.
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onMutate: async (mutedCategories) => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.preferences(),
      });
      const previous = queryClient.getQueryData<
        ApiResponse<NotificationPreferences>
      >(notificationKeys.preferences());

      if (previous) {
        queryClient.setQueryData<ApiResponse<NotificationPreferences>>(
          notificationKeys.preferences(),
          {
            ...previous,
            data: { ...previous.data, mutedCategories },
          }
        );
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.preferences(),
          context.previous
        );
      }
    },
    onSuccess: (response) => {
      // PATCH only returns mutedCategories — keep the cached `categories` list.
      queryClient.setQueryData<ApiResponse<NotificationPreferences>>(
        notificationKeys.preferences(),
        (old) =>
          old
            ? { ...old, data: { ...old.data, ...response.data } }
            : response
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unseen() });
      queryClient.invalidateQueries({
        queryKey: [...notificationKeys.all, "list"],
      });
    },
  });
}
