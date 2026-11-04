import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { BrandLogoSvg } from "./brand-logo";

export function Logo({
  className,
  size = "md",
  showText = true,
  showTextOnMobile = false,
  href = "/",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTextOnMobile?: boolean;
  href?: string;
}) {
  const svgSize = size === "lg" ? 44 : size === "md" ? 38 : 30;
  const t = useTranslations("Common");

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 font-semibold tracking-tight transition-opacity hover:opacity-90",
        className
      )}
    >
      <BrandLogoSvg size={svgSize} />

      {showText && (
        <div
          className={cn(
            showTextOnMobile ? "flex flex-col" : "hidden sm:flex flex-col",
            "leading-none gap-1"
          )}
        >
          <span
            className={cn(
              "font-extrabold tracking-tight font-heading bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent",
              size === "lg" && "text-2xl tracking-tighter",
              size === "md" && "text-xl tracking-tight",
              size === "sm" && "text-base"
            )}
          >
            Banky<span className="text-primary font-black">Bondy</span>
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground/80 tracking-[0.18em] uppercase">
            {t("brandTagline")}
          </span>
        </div>
      )}

    </Link>
  );

}


