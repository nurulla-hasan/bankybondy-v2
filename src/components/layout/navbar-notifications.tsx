"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  CheckCheck,
  Settings,
  ArrowLeft,
  Link2,
  Handshake,
  PartyPopper,
  Star,
  UserPlus,
  UserCheck,
  Gift,
  Sparkles,
  MessageCircle,
  Crown,
  Clock,
  Trash2,
  Loader2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";
import {
  useDeleteNotification,
  useNotificationPreferences,
  useNotifications,
  useSeeNotifications,
  useSeeOneNotification,
  useUnseenNotificationCount,
  useUpdateNotificationPreferences,
} from "@/services";
import { errorToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/error";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type {
  NotificationCategory,
  NotificationItem,
  NotificationType,
} from "@/types";

interface TypeVisual {
  Icon: LucideIcon;
  className: string;
}

const TYPE_VISUALS: Record<string, TypeVisual> = {
  MATCH: { Icon: Link2, className: "bg-primary/10 text-primary" },
  GENERAL: { Icon: Sparkles, className: "bg-primary/10 text-primary" },
  TRADE_PROPOSED: {
    Icon: Handshake,
    className: "bg-amber-accent/10 text-amber-accent",
  },
  TRADE_COMPLETED: {
    Icon: PartyPopper,
    className: "bg-emerald-accent/10 text-emerald-accent",
  },
  TRADE_REMINDER: {
    Icon: Clock,
    className: "bg-amber-accent/10 text-amber-accent",
  },
  GIFT_RECEIVED: {
    Icon: Gift,
    className: "bg-pink-accent/10 text-pink-accent",
  },
  GIFT_GIVEN: {
    Icon: Gift,
    className: "bg-pink-accent/10 text-pink-accent",
  },
  DOUBLE_SURPRISE: {
    Icon: Sparkles,
    className: "bg-pink-accent/10 text-pink-accent",
  },
  ENCOUNTER: {
    Icon: MessageCircle,
    className: "bg-cyan-glow/10 text-cyan-glow",
  },
  REVIEW: {
    Icon: Star,
    className: "bg-amber-accent/10 text-amber-accent",
  },
  FRIEND_REQUEST: {
    Icon: UserPlus,
    className: "bg-violet-accent/10 text-violet-accent",
  },
  FRIEND_ACCEPTED: {
    Icon: UserCheck,
    className: "bg-emerald-accent/10 text-emerald-accent",
  },
  SUBSCRIPTION: {
    Icon: Crown,
    className: "bg-amber-accent/10 text-amber-accent",
  },
};

const DEFAULT_TYPE_VISUAL: TypeVisual = {
  Icon: Bell,
  className: "bg-muted text-muted-foreground",
};

interface CategoryMeta {
  Icon: LucideIcon;
  labelKey:
    | "categoryMatches"
    | "categoryTrades"
    | "categoryReviews"
    | "categoryFriends"
    | "categorySubscription";
  className: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  matches: {
    Icon: Link2,
    labelKey: "categoryMatches",
    className: "bg-primary/10 text-primary",
  },
  trueques: {
    Icon: Handshake,
    labelKey: "categoryTrades",
    className: "bg-amber-accent/10 text-amber-accent",
  },
  resenas: {
    Icon: Star,
    labelKey: "categoryReviews",
    className: "bg-amber-accent/10 text-amber-accent",
  },
  amistades: {
    Icon: UserPlus,
    labelKey: "categoryFriends",
    className: "bg-violet-accent/10 text-violet-accent",
  },
  suscripcion: {
    Icon: Crown,
    labelKey: "categorySubscription",
    className: "bg-amber-accent/10 text-amber-accent",
  },
};

const CATEGORY_ORDER: NotificationCategory[] = [
  "matches",
  "trueques",
  "resenas",
  "amistades",
  "suscripcion",
];

const MAX_LIST = 500;

/** Locale-aware relative time, no extra dependency. */
function relativeTime(dateStr: string, locale: string): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "";

  const diffSec = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale || "en", { numeric: "auto" });

  if (abs < 60) return rtf.format(Math.round(diffSec), "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  return rtf.format(Math.round(diffSec / 2592000), "month");
}

function routeFor(item: NotificationItem): string | null {
  switch (item.type as NotificationType) {
    case "MATCH":
    case "GENERAL":
      return item.redirectId
        ? `/bonds/all-bonds?match=${item.redirectId}`
        : "/bonds/all-bonds";
    case "TRADE_PROPOSED":
    case "TRADE_COMPLETED":
    case "GIFT_RECEIVED":
    case "GIFT_GIVEN":
    case "DOUBLE_SURPRISE":
    case "ENCOUNTER":
    case "TRADE_REMINDER":
      return "/messages";
    case "SUBSCRIPTION":
      return "/subscriptions";
    case "REVIEW":
      return "/profile";
    case "FRIEND_REQUEST":
      return "/friends";
    case "FRIEND_ACCEPTED":
      return item.redirectId ? `/people/${item.redirectId}` : "/friends";
    default:
      return null;
  }
}

interface NavbarNotificationsProps {
  className?: string;
}

export function NavbarNotifications({ className }: NavbarNotificationsProps) {
  const t = useTranslations("Navbar");
  const router = useRouter();
  const locale = useLocale();
  const { isAuthenticated } = useAuth();

  const [open, setOpen] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [limit, setLimit] = React.useState(20);

  const { data: unseenData } = useUnseenNotificationCount(isAuthenticated);
  const unseenCount = unseenData?.data?.unseenCount ?? 0;
  const badgeLabel = unseenCount > 99 ? "99+" : unseenCount;

  const listParams = React.useMemo(
    () => ({ limit, sort: "-createdAt" }),
    [limit]
  );

  const { data: listData, isLoading, isFetching, isError } = useNotifications(
    listParams,
    open && isAuthenticated && !showSettings
  );
  const notifications = listData?.data?.result ?? [];
  const total = listData?.data?.meta?.total ?? 0;
  const hasMore = notifications.length < Math.min(total, MAX_LIST);

  const { data: prefsData, isLoading: isPrefsLoading } =
    useNotificationPreferences(open && isAuthenticated && showSettings);
  const mutedCategories = prefsData?.data?.mutedCategories ?? [];
  const categories =
    prefsData?.data?.categories ?? CATEGORY_ORDER;

  const { mutate: markAll, isPending: isMarkingAll } = useSeeNotifications();
  const { mutate: markOne } = useSeeOneNotification();
  const { mutate: deleteOne } = useDeleteNotification();
  const { mutate: updatePrefs, isPending: isSavingPrefs } =
    useUpdateNotificationPreferences();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setShowSettings(false);
      setLimit(20);
    }
  };

  const handleMarkAll = () => {
    markAll(undefined, {
      onError: (err) =>
        errorToast("Couldn't mark notifications as read", getErrorMessage(err)),
    });
  };

  const handleItemClick = (item: NotificationItem) => {
    setOpen(false);
    markOne(item._id);
    const href = routeFor(item);
    if (href) router.push(href);
  };

  const handleDelete = (item: NotificationItem) => {
    deleteOne(item._id, {
      onError: (err) =>
        errorToast("Couldn't delete notification", getErrorMessage(err)),
    });
  };

  const handleToggleCategory = (category: string, notify: boolean) => {
    const next = notify
      ? mutedCategories.filter((c) => c !== category)
      : [...new Set([...mutedCategories, category])];

    updatePrefs(next as NotificationCategory[], {
      onError: (err) =>
        errorToast("Couldn't update preferences", getErrorMessage(err)),
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || isFetching) return;
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 64) {
      setLimit((current) => Math.min(current + 20, MAX_LIST));
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative", className)}
            aria-label={t("notifications")}
          >
            <Bell className="size-4" />
            {unseenCount > 0 && (
              <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-xs font-bold leading-none">
                {badgeLabel}
              </span>
            )}
          </Button>
        }
      />

      <PopoverContent
        align="end"
        className="max-h-(--available-height) w-88 max-w-(--available-width)"
      >
        <div className="-m-2.5 flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              {showSettings && (
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  aria-label={t("back")}
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <h4 className="text-foreground truncate text-sm font-semibold">
                {showSettings
                  ? t("notificationSettings")
                  : t("notifications")}
              </h4>
              {!showSettings && unseenCount > 0 && (
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                  {badgeLabel}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {!showSettings && unseenCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMarkAll}
                  disabled={isMarkingAll}
                  aria-label={t("markAllAsRead")}
                  title={t("markAllAsRead")}
                >
                  <CheckCheck className="size-4" />
                </Button>
              )}
              {isAuthenticated && (
                <Button
                  variant={showSettings ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setShowSettings((current) => !current)}
                  aria-label={t("notificationSettings")}
                  title={t("notificationSettings")}
                >
                  <Settings className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <Bell className="text-muted-foreground/60 size-6" />
              <p className="text-muted-foreground text-xs">
                {t("signInToViewNotifications")}
              </p>
              <Button
                onClick={() => {
                  setOpen(false);
                  router.push("/login");
                }}
              >
                {t("signIn")}
              </Button>
            </div>
          ) : showSettings ? (
            /* Preferences */
            <div className="max-h-80 overflow-y-auto overscroll-contain p-2">
              <p className="px-2 pb-2 pt-1 text-xs leading-relaxed text-muted-foreground">
                {t("muteHint")}
              </p>

              {isPrefsLoading ? (
                <div className="space-y-1">
                  {[0, 1, 2, 3, 4].map((row) => (
                    <div
                      key={row}
                      className="flex items-center justify-between px-2 py-2.5"
                    >
                      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-8 animate-pulse rounded-full bg-muted" />
                    </div>
                  ))}
                </div>
              ) : (
                categories.map((category) => {
                  const meta = CATEGORY_META[category];
                  if (!meta) return null;
                  const Icon = meta.Icon;
                  const notify = !mutedCategories.includes(category);

                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60"
                    >
                      <span className="flex min-w-0 items-center gap-2.5 text-sm text-foreground">
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full",
                            meta.className
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="truncate">{t(meta.labelKey)}</span>
                      </span>
                      <Switch
                        checked={notify}
                        onCheckedChange={(checked) =>
                          handleToggleCategory(category, checked)
                        }
                        disabled={isSavingPrefs}
                        aria-label={t(meta.labelKey)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Notifications list */
            <div
              className="max-h-96 min-h-0 flex-1 overflow-y-auto overscroll-contain"
              onScroll={handleScroll}
            >
              {isLoading ? (
                <div className="space-y-1 p-2">
                  {[0, 1, 2, 3].map((row) => (
                    <div key={row} className="flex items-start gap-3 px-2 py-2.5">
                      <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-full animate-pulse rounded bg-muted" />
                        <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Bell className="size-6 text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground">
                    {t("loadError")}
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Bell className="size-6 text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground">
                    {t("noNotifications")}
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const visual = TYPE_VISUALS[item.type] ?? DEFAULT_TYPE_VISUAL;
                  const Icon = visual.Icon;

                  return (
                    <div key={item._id} className="group relative">
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className="flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/60 cursor-pointer"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                            visual.className
                          )}
                          aria-hidden
                        >
                          <Icon className="size-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {item.title}
                          </span>
                          {item.message && (
                            <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {item.message}
                            </span>
                          )}
                          <span className="text-muted-foreground/80 mt-1 block text-xs">
                            {relativeTime(item.createdAt, locale)}
                          </span>
                        </span>
                      </button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                        aria-label={t("deleteNotification")}
                        title={t("deleteNotification")}
                        className="absolute top-2 right-2 opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 className="text-destructive size-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}

              {isFetching && !isLoading && notifications.length > 0 && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NavbarNotifications;
