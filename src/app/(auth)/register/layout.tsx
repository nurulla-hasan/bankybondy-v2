import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Auth"),
  ]);

  return buildMetadata({
    title: t("signUpTitle"),
    description: t("signUpSubtitle"),
    path: "/register",
    locale,
    noindex: true,
  });
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
