"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, LogOut, User as UserIcon } from "lucide-react";

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
              className="rounded-full cursor-pointer hover:ring-2 hover:ring-primary/20"
              aria-label={user.name || "User account menu"}
            >
              <Avatar className="size-8">
                <AvatarImage
                  src={user.profile_image}
                  alt={user.name || "User Avatar"}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-foreground leading-none">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground leading-none truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserIcon className="size-4 mr-2" />
              <span>{t("profile")}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="size-4 mr-2" />
            <span>{t("logOut")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="hidden sm:flex items-center">
      <Button
        render={<Link href="/login" />}
        className="cursor-pointer font-medium px-4"
      >
        <span>{t("getStarted")}</span>
        <ArrowRight />
      </Button>
    </div>
  );
}

export default NavbarUserMenu;
