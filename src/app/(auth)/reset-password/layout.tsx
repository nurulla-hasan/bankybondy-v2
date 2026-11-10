import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Auth"),
  ]);

  return buildMetadata({
    title: t("resetPasswordTitle"),
    description: t("resetPasswordSubtitle"),
    path: "/reset-password",
    locale,
    noindex: true,
  });
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
