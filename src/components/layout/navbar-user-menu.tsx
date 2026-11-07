"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  LogOut,
  MessageSquare,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";

import {
  useChatUnreadCount,
  useGetMyProfile,
  useLogout,
  usePendingFriendRequestCount,
} from "@/services";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types";

interface NavbarUserMenuProps {
  user?: AuthUser | null;
  isLoading?: boolean;
  onLogout?: () => void;
  className?: string;
}

export function NavbarUserMenu({
  user: userProp,
  isLoading: isLoadingProp,
  onLogout: onLogoutProp,
  className,
}: NavbarUserMenuProps) {
  const t = useTranslations("Navbar");
  const tMessages = useTranslations("Messages");

  const { data: profileData, isLoading: queryLoading } = useGetMyProfile();
  const { mutate: queryLogout } = useLogout();
  const { data: pendingRequests = 0 } = usePendingFriendRequestCount();

  const user = userProp !== undefined ? userProp : profileData?.data;
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : queryLoading;
  const handleLogout = onLogoutProp ?? (() => queryLogout());

  // Messages is a personal workspace, so it lives here instead of the main nav.
  const { data: unread } = useChatUnreadCount(Boolean(user));
  const unreadTotal = unread?.totalUnread ?? 0;
  const unreadLabel =
    unreadTotal > 99 ? tMessages("unseenCap") : String(unreadTotal);

  if (isLoading) {
    return (
      <div
        className={cn(
          "hidden md:block size-9 animate-pulse rounded-full bg-muted",
          className,
        )}
      />
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={cn("hidden md:inline-flex rounded-full", className)}
              aria-label={user.name || "User account menu"}
            >
              <Avatar className="size-8">
                <AvatarImage
                  src={user.profile_image}
                  alt={user.name || "User Avatar"}
                />
                <AvatarFallback />
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-foreground text-sm font-semibold leading-none">
                  {user.name || "User"}
                </p>
                <p className="text-muted-foreground truncate text-xs leading-none">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserIcon className="size-4 mr-2" />
              <span>{t("profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/messages" />}>
              <MessageSquare className="size-4 mr-2" />
              <span>{t("messages")}</span>
              {unreadTotal > 0 ? (
                <span className="ml-auto inline-flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold leading-none text-primary-foreground">
                  {unreadLabel}
                </span>
              ) : null}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Users className="size-4 mr-2" />
                <span>
                  {pendingRequests > 0
                    ? t("friendsCount", { count: pendingRequests })
                    : t("friends")}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem
                  render={<Link href="/friends?tab=requests" />}
                >
                  <span>{t("friendRequests")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/friends?tab=sent" />}>
                  <span>{t("friendSent")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/friends?tab=friends" />}>
                  <span>{t("friends")}</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="size-4 mr-2" />
              <span>{t("settings")}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut className="size-4" />
            <span>{t("logOut")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="hidden sm:flex items-center">
      <Button render={<Link href="/login" />}>
        <span>{t("getStarted")}</span>
        <ArrowRight />
      </Button>
    </div>
  );
}

export default NavbarUserMenu;
