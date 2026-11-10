import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("PaymentResult"),
  ]);

  return buildMetadata({
    title: t("cancel.title"),
    description: t("cancel.description"),
    path: "/cancel",
    locale,
    noindex: true,
  });
}

export default function PaymentCancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
