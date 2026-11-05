"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useGetMyProfile, useLogout } from "@/services";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AuthUser } from "@/types";
import type { NavLinkItem } from "./nav-items";

interface MobileNavProps {
  items: NavLinkItem[];
  user?: AuthUser | null;
  isLoading?: boolean;
  onLogout?: () => void;
  className?: string;
}

export function MobileNav({
  items,
  user: userProp,
  isLoading: isLoadingProp,
  onLogout: onLogoutProp,
  className,
}: MobileNavProps) {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const { data: profileData, isLoading: queryLoading } = useGetMyProfile();
  const { mutate: queryLogout } = useLogout();

  const user = userProp !== undefined ? userProp : profileData?.data;
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : queryLoading;
  const handleLogout = () => {
    if (onLogoutProp) {
      onLogoutProp();
    } else {
      queryLogout();
    }
    setOpen(false);
  };

  return (
    <div className={cn("flex md:hidden", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              className="rounded-lg cursor-pointer"
              aria-label={t("menu")}
            >
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent
          side="right"
          className="w-72 p-6 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <SheetHeader className="text-left pb-4 border-b border-border">
              <SheetTitle>
                <Logo size="sm" />
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Navigation Links */}
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col space-y-1"
            >
              {items.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{link.name}</span>
                    {link.badge !== undefined && (
                      <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Bottom User Status or CTA */}
          <div className="pt-6 border-t border-border flex flex-col gap-3">
            {isLoading ? (
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-1">
                  <Avatar className="size-9">
                    <AvatarImage
                      src={user.profile_image}
                      alt={user.name || "User Avatar"}
                    />
                    <AvatarFallback />
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate leading-tight">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <UserIcon className="size-4 shrink-0" />
                    <span>{t("profile")}</span>
                  </Link>
                  <Link
                    href="/friends"
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <Users className="size-4 shrink-0" />
                    <span>{t("friends")}</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Settings className="size-4 shrink-0" />
                    <span>{t("settings")}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-4 shrink-0" />
                    <span>{t("logOut")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full justify-center cursor-pointer font-medium"
                render={<Link href="/login" />}
                onClick={() => setOpen(false)}
              >
                <span>{t("getStarted")}</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNav;
