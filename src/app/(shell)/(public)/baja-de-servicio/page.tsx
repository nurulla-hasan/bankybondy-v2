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
    title: t("consumidor.tituloBaja"),
    description: t("consumidor.introBaja"),
    path: "/baja-de-servicio",
    locale,
  });
}

export default function BajaDeServicioPage() {
  return <ConsumerRequestForm tipo="baja" />;
}
