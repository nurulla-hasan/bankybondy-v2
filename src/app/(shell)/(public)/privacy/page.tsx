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
    title: t("pages.privacy.metaTitle"),
    description: t("pages.privacy.metaDescription"),
    path: "/privacy",
    locale,
  });
}

export default function PrivacyPage() {
  return <LegalDocumentPage kind="privacy" />;
}
