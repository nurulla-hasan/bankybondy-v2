"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageToggleProps {
  variant?: "ghost" | "outline" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LanguageToggle({
  variant = "ghost",
  size = "icon",
  className,
}: LanguageToggleProps) {
  const locale = useLocale();
  const router = useRouter();

  const handleLanguageChange = (nextLocale: "es" | "en") => {
    // Set cookie for 1 year so next-intl picks it up across clean URLs
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={variant}
            size={size}
            className={className || "cursor-pointer"}
            aria-label="Change language"
          >
            <Globe/>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("es")}
          className={locale === "es" ? "font-bold text-primary" : ""}
        >
          🇪🇸 Español (ES)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className={locale === "en" ? "font-bold text-primary" : ""}
        >
          🇺🇸 English (EN)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

