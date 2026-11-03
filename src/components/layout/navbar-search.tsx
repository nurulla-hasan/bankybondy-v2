"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Search,
  Home,
  Handshake,
  Users,
  MessageSquare,
  Radio,
  HeartHandshake,
  User,
  Moon,
  Sun,
  LogOut,
  LogIn,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useGetMyProfile, useLogout } from "@/services";

interface NavbarSearchProps {
  className?: string;
  triggerVariant?: "pill" | "icon";
}

export function NavbarSearch({
  className,
  triggerVariant = "pill",
}: NavbarSearchProps) {
  const t = useTranslations("Navbar");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  const { data: profileData } = useGetMyProfile();
  const { mutate: logout } = useLogout();
  const user = profileData?.data;

  // Global ⌘K / Ctrl+K shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = React.useCallback(
    (action: () => void) => {
      setOpen(false);
      action();
    },
    [],
  );

  return (
    <>
      {/* Trigger Button */}
      {triggerVariant === "icon" ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className={cn("rounded-lg cursor-pointer", className)}
          aria-label={t("search")}
        >
          <Search className="size-4" />
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer select-none",
            className,
          )}
          aria-label={t("search")}
        >
          <Search className="size-3.5 text-muted-foreground/80 group-hover:text-foreground transition-colors" />
          <span className="hidden sm:inline font-normal">{t("search")}</span>
          <kbd className="pointer-events-none hidden sm:inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </button>
      )}

      {/* Command Palette Dialog */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("search")}
        description={t("searchPlaceholder")}
      >
        <CommandInput placeholder={t("searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation Links Group */}
          <CommandGroup heading={t("navigation")}>
            <CommandItem onSelect={() => handleSelect(() => router.push("/"))}>
              <Home className="size-4 mr-2" />
              <span>{t("Home")}</span>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => router.push("/donate"))}
            >
              <HeartHandshake className="size-4 mr-2" />
              <span>{t("Donate")}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => router.push("/bonds"))}
            >
              <Handshake className="size-4 mr-2" />
              <span>{t("Bonds")}</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => router.push("/people"))}
            >
              <Users className="size-4 mr-2" />
              <span>{t("People")}</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => router.push("/messages"))}
            >
              <MessageSquare className="size-4 mr-2" />
              <span>{t("Messages")}</span>
              <CommandShortcut>⌘M</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => router.push("/chatting"))}
            >
              <Radio className="size-4 mr-2" />
              <span>{t("Chatting")}</span>
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Actions & Settings Group */}
          <CommandGroup heading={t("actions")}>
            <CommandItem
              onSelect={() =>
                handleSelect(() =>
                  setTheme(theme === "dark" ? "light" : "dark"),
                )
              }
            >
              {theme === "dark" ? (
                <Sun className="size-4 mr-2 text-amber-400" />
              ) : (
                <Moon className="size-4 mr-2 text-indigo-400" />
              )}
              <span>
                {theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"}
              </span>
            </CommandItem>

            {user ? (
              <>
                <CommandItem
                  onSelect={() =>
                    handleSelect(() => router.push("/profile"))
                  }
                >
                  <User className="size-4 mr-2" />
                  <span>{t("profile")}</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => logout())}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4 mr-2" />
                  <span>{t("logOut")}</span>
                </CommandItem>
              </>
            ) : (
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/login"))}
              >
                <LogIn className="size-4 mr-2" />
                <span>{t("signIn")}</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default NavbarSearch;
