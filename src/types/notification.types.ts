export type NotificationType =
  | "COURSE"
  | "FEEDBACK"
  | "CLASS"
  | "ORDER"
  | "GENERAL"
  | "PAYMENT"
  | "MATCH"
  | "TRADE_PROPOSED"
  | "TRADE_COMPLETED"
  | "REVIEW"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "GIFT_RECEIVED"
  | "GIFT_GIVEN"
  | "DOUBLE_SURPRISE"
  | "ENCOUNTER"
  | "SUBSCRIPTION"
  | "TRADE_REMINDER";

export type NotificationCategory =
  | "matches"
  | "trueques"
  | "resenas"
  | "amistades"
  | "suscripcion";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  redirectId?: string | null;
  receiver?: string;
  /** Per-user read state computed by the API (`seenBy` is never exposed). */
  seen?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListResult {
  meta: NotificationListMeta;
  result: NotificationItem[];
}

export interface UnseenNotificationResult {
  unseenCount: number;
  latestNotification: NotificationItem | null;
}

export interface NotificationPreferences {
  mutedCategories: NotificationCategory[];
  categories?: NotificationCategory[];
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
}
