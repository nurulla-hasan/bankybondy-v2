"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";
import { useChatUnreadCount } from "@/services";
import { Button } from "@/components/ui/button";

interface NavbarMessagesProps {
  className?: string;
}

export function NavbarMessages({ className }: NavbarMessagesProps) {
  const t = useTranslations("Navbar");
  const tMessages = useTranslations("Messages");
  const { isAuthenticated } = useAuth();

  const { data: unread } = useChatUnreadCount(isAuthenticated);
  const unreadTotal = unread?.totalUnread ?? 0;
  const badgeLabel =
    unreadTotal > 99 ? tMessages("unseenCap") : String(unreadTotal);

  if (!isAuthenticated) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      render={<Link href="/messages" />}
      className={cn("relative", className)}
      aria-label={t("messages")}
    >
      <MessageSquare className="size-4" />
      {unreadTotal > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-xs font-bold leading-none">
          {badgeLabel}
        </span>
      )}
    </Button>
  );
}

export default NavbarMessages;
