"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, LogOut, Settings, User as UserIcon } from "lucide-react";

import { useGetMyProfile, useLogout } from "@/services";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
}: NavbarUserMenuProps) {
  const t = useTranslations("Navbar");

  const { data: profileData, isLoading: queryLoading } = useGetMyProfile();
  const { mutate: queryLogout } = useLogout();

  const user = userProp !== undefined ? userProp : profileData?.data;
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : queryLoading;
  const handleLogout = onLogoutProp ?? (() => queryLogout());

  if (isLoading) {
    return <div className="size-9 animate-pulse rounded-full bg-muted" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
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
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserIcon className="size-4 mr-2" />
              <span>{t("profile")}</span>
            </DropdownMenuItem>
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
