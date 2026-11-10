import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/**
 * Everything under `(private)` requires a signed-in session. It is disallowed
 * in robots.txt and marked `noindex` here so leaked URLs never get indexed.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Common");

  return {
    title: t("brandName"),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
