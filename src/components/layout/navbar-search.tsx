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
  Headphones,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import { useGlobalSearch, useGetMyProfile, useLogout } from "@/services";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { SearchBond, SearchAudio } from "@/types";

const MIN_SEARCH_LENGTH = 2;

interface NavbarSearchProps {
  className?: string;
  triggerVariant?: "pill" | "icon";
  showLabelOnMobile?: boolean;
}

export function NavbarSearch({
  className,
  triggerVariant = "pill",
  showLabelOnMobile = false,
}: NavbarSearchProps) {
  const t = useTranslations("Navbar");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const debouncedQuery = useDebounce(query, 300);
  const term = debouncedQuery.trim();
  const canSearch = term.length >= MIN_SEARCH_LENGTH;

  const { data: profileData } = useGetMyProfile();
  const { mutate: logout } = useLogout();
  const user = profileData?.data;

  // Search endpoint requires auth — guests keep the static palette instead.
  const showResults = canSearch && Boolean(user);

  const { data: searchData, isFetching } = useGlobalSearch(debouncedQuery, {
    enabled: open && Boolean(user),
  });

  const results = searchData?.data;
  const people = results?.people ?? [];
  const bonds = results?.bonds ?? [];
  const audios = results?.audios ?? [];
  const hasResults = people.length > 0 || bonds.length > 0 || audios.length > 0;

  // Reset the query whenever the palette closes, so it opens clean next time.
  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  }, []);

  // Global ⌘K / Ctrl+K shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenChange(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleOpenChange]);

  const handleSelect = React.useCallback(
    (action: () => void) => {
      handleOpenChange(false);
      action();
    },
    [handleOpenChange],
  );

  // "empty" / "surprise" are backend wildcard tokens, not readable labels.
  const offerWantLabel = (value: string) => {
    const normalized = (value ?? "").trim().toLowerCase();
    if (normalized === "empty") return t("bondEmpty");
    if (normalized === "surprise") return t("bondSurprise");
    return value;
  };

  const bondLabel = (bond: SearchBond) =>
    `${t("offers")} ${offerWantLabel(bond.offer)} · ${t("wants")} ${offerWantLabel(bond.want)}`;

  return (
    <>
      {/* Trigger Button */}
      {triggerVariant === "icon" ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className={cn(className)}
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
          <span
            className={cn(
              showLabelOnMobile ? "inline" : "hidden sm:inline",
              "font-normal",
            )}
          >
            {t("search")}
          </span>
          <kbd className="border-border bg-background text-muted-foreground pointer-events-none hidden h-4.5 select-none items-center gap-0.5 rounded border px-1.5 font-mono text-xs font-medium shadow-2xs sm:inline-flex">
            <span>⌘</span>K
          </kbd>
        </button>
      )}

      {/* Command Palette Dialog */}
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t("search")}
        description={t("searchPlaceholder")}
        shouldFilter={false}
      >
        <CommandInput
          placeholder={t("searchPlaceholder")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {showResults ? (
            <>
              {isFetching && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{t("searching")}</span>
                </div>
              )}

              {!isFetching && !hasResults && (
                <CommandEmpty>{t("noResults")}</CommandEmpty>
              )}

              {people.length > 0 && (
                <CommandGroup heading={t("sectionPeople")}>
                  {people.map((person) => (
                    <CommandItem
                      key={person._id}
                      value={`person-${person._id}`}
                      onSelect={() =>
                        handleSelect(() => router.push(`/people/${person._id}`))
                      }
                    >
                      <Avatar className="size-8">
                        <AvatarImage
                          src={person.profile_image}
                          alt={person.name}
                        />
                        <AvatarFallback />
                      </Avatar>
                      <span className="truncate text-sm font-medium">
                        {person.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {bonds.length > 0 && (
                <CommandGroup heading={t("sectionBonds")}>
                  {bonds.map((bond) => (
                    <CommandItem
                      key={bond._id}
                      value={`bond-${bond._id}`}
                      onSelect={() =>
                        handleSelect(() =>
                          router.push(
                            bond.user?._id
                              ? `/people/${bond.user._id}`
                              : "/bonds",
                          ),
                        )
                      }
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Handshake className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {bondLabel(bond)}
                        </span>
                        {bond.user?.name && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {bond.user.name}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {audios.length > 0 && (
                <CommandGroup heading={t("sectionAudios")}>
                  {audios.map((audio: SearchAudio) => (
                    <CommandItem
                      key={audio._id}
                      value={`audio-${audio._id}`}
                      onSelect={() =>
                        handleSelect(() =>
                          router.push(`/chatting/conversations/${audio._id}`),
                        )
                      }
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Headphones className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {audio.title}
                        </span>
                        {audio.user?.name && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {audio.user.name}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          ) : (
            <>
              <CommandEmpty>{t("noResults")}</CommandEmpty>

              {/* Navigation Links Group */}
              <CommandGroup heading={t("navigation")}>
                <CommandItem
                  onSelect={() => handleSelect(() => router.push("/"))}
                >
                  <Home className="size-4" />
                  <span>{t("Home")}</span>
                  <CommandShortcut>⌘H</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => router.push("/donate"))}
                >
                  <HeartHandshake className="size-4" />
                  <span>{t("Donate")}</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => router.push("/bonds"))}
                >
                  <Handshake className="size-4" />
                  <span>{t("Bonds")}</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => router.push("/people"))}
                >
                  <Users className="size-4" />
                  <span>{t("People")}</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => router.push("/messages"))}
                >
                  <MessageSquare className="size-4" />
                  <span>{t("Messages")}</span>
                  <CommandShortcut>⌘M</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSelect(() => router.push("/chatting"))}
                >
                  <Radio className="size-4" />
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
                    <Sun className="text-amber-accent size-4" />
                  ) : (
                    <Moon className="text-violet-accent size-4" />
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
                      <User className="size-4" />
                      <span>{t("profile")}</span>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleSelect(() => logout())}
                    >
                      <LogOut className="text-destructive size-4" />
                      <span className="text-destructive">{t("logOut")}</span>
                    </CommandItem>
                  </>
                ) : (
                  <CommandItem
                    onSelect={() => handleSelect(() => router.push("/login"))}
                  >
                    <LogIn className="size-4" />
                    <span>{t("signIn")}</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default NavbarSearch;
