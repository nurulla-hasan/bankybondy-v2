import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { ConsumerRequestForm } from "@/components/legal/consumer-request-form";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Legal"),
  ]);

  return buildMetadata({
    title: t("consumidor.tituloArrepentimiento"),
    description: t("consumidor.introArrepentimiento"),
    path: "/arrepentimiento",
    locale,
  });
}

export default function ArrepentimientoPage() {
  return <ConsumerRequestForm tipo="arrepentimiento" />;
}
