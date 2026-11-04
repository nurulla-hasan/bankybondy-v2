import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  NotificationCategory,
  NotificationListResult,
  NotificationPreferences,
  NotificationQueryParams,
  UnseenNotificationResult,
} from "@/types";

/**
 * List notifications for the authenticated user.
 * Endpoint: GET /notification/get-notifications
 */
export function getNotifications(params?: NotificationQueryParams) {
  return apiClient<ApiResponse<NotificationListResult>>(
    "/notification/get-notifications",
    {
      method: "GET",
      query: params,
    }
  );
}

/**
 * Unseen notification count + latest notification (badge seed).
 * Endpoint: GET /notification/unseen-count
 */
export function getUnseenNotificationCount() {
  return apiClient<ApiResponse<UnseenNotificationResult>>(
    "/notification/unseen-count",
    { method: "GET" }
  );
}

/**
 * Mark every notification as seen.
 * Endpoint: PATCH /notification/see-notifications
 */
export function seeNotifications() {
  return apiClient<ApiResponse<null>>("/notification/see-notifications", {
    method: "PATCH",
  });
}

/**
 * Mark a single notification as seen.
 * Endpoint: PATCH /notification/see-notification/:id
 */
export function seeOneNotification(id: string) {
  return apiClient<ApiResponse<null>>(`/notification/see-notification/${id}`, {
    method: "PATCH",
  });
}

/**
 * Delete a notification.
 * Endpoint: DELETE /notification/delete-notification/:id
 */
export function deleteNotification(id: string) {
  return apiClient<ApiResponse<null>>(
    `/notification/delete-notification/${id}`,
    { method: "DELETE" }
  );
}

/**
 * Muted notification categories.
 * Endpoint: GET /notification/preferences
 */
export function getNotificationPreferences() {
  return apiClient<ApiResponse<NotificationPreferences>>(
    "/notification/preferences",
    { method: "GET" }
  );
}

/**
 * Replace the muted categories set.
 * Endpoint: PATCH /notification/preferences
 */
export function updateNotificationPreferences(
  mutedCategories: NotificationCategory[]
) {
  return apiClient<ApiResponse<NotificationPreferences>>(
    "/notification/preferences",
    {
      method: "PATCH",
      body: { mutedCategories },
    }
  );
}
