import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Legal"),
  ]);

  return buildMetadata({
    title: t("pages.about.metaTitle"),
    description: t("pages.about.metaDescription"),
    path: "/about",
    locale,
  });
}

export default function AboutPage() {
  return <LegalDocumentPage kind="about" />;
}
