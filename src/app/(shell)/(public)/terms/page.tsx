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
    title: t("pages.terms.metaTitle"),
    description: t("pages.terms.metaDescription"),
    path: "/terms",
    locale,
  });
}

export default function TermsPage() {
  return <LegalDocumentPage kind="terms" />;
}
