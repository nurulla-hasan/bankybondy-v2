import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-logo";

export function Logo({
  className,
  size = "md",
  showText = false,
  showTextOnMobile = false,
  href = "/",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTextOnMobile?: boolean;
  href?: string;
}) {
  const svgSize = size === "lg" ? 36 : size === "md" ? 30 : 24;
  const t = useTranslations("Common");

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 font-semibold tracking-tight transition-opacity hover:opacity-90",
        className
      )}
    >
      <BrandMark size={svgSize} />

      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight font-heading text-foreground",
            size === "lg" && "text-2xl tracking-tighter",
            size === "md" && "text-xl tracking-tight",
            size === "sm" && "text-base"
          )}
        >
          Bankybondy
        </span>
      )}

    </Link>
  );

}


