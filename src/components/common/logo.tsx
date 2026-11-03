import Link from "next/link";
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
            "leading-none gap-0.5"
          )}
        >
          <span
            className={cn(
              "font-bold tracking-tight text-foreground font-heading",
              size === "lg" && "text-xl",
              size === "md" && "text-lg",
              size === "sm" && "text-base"
            )}
          >
            BankyBondy
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
            Red de Vínculos
          </span>
        </div>
      )}
    </Link>
  );

}


