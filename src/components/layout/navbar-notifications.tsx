"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Bell, CheckCheck, MessageSquare, HeartHandshake, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type?: "message" | "bond" | "system";
}

interface NavbarNotificationsProps {
  className?: string;
  notifications?: NotificationItem[];
}

export function NavbarNotifications({
  className,
  notifications: initialNotifications,
}: NavbarNotificationsProps) {
  const t = useTranslations("Navbar");

  // Sample initial notifications (ready to be replaced by notifications API hook)
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    initialNotifications ?? [
      {
        id: "1",
        title: "New conversation request",
        description: "Someone wants to start an audio talk with you.",
        time: "5m ago",
        read: false,
        type: "message",
      },
      {
        id: "2",
        title: "Bond matched!",
        description: "Your skill offering matched with a new community bond.",
        time: "1h ago",
        read: false,
        type: "bond",
      },
    ],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative rounded-lg cursor-pointer", className)}
            aria-label={t("notifications")}
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">
              {t("notifications")}
            </h4>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <CheckCheck className="size-3.5" />
              <span>{t("markAllAsRead")}</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {t("noNotifications")}
            </div>
          ) : (
            notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markAsRead(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-muted/60 cursor-pointer",
                  !item.read && "bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    item.type === "message"
                      ? "bg-primary/10 text-primary"
                      : item.type === "bond"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-cyan-500/10 text-cyan-500",
                  )}
                >
                  {item.type === "message" ? (
                    <MessageSquare className="size-4" />
                  ) : item.type === "bond" ? (
                    <HeartHandshake className="size-4" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {!item.read && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0 self-center" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NavbarNotifications;
