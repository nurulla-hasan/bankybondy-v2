import type { Metadata } from "next";

/**
 * Central SEO configuration.
 *
 * Every canonical URL, OG image reference and structured-data block reads from
 * here so the production origin only ever lives in one place.
 */

const FALLBACK_SITE_URL = "https://bankybondy.com";

function toOrigin(value: string): string | null {
  try {
    // Keep the origin only: a stray path or trailing slash in the env var must
    // not leak into canonical URLs.
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * An IP address, localhost or an intranet host is fine for browsing but must
 * never become a canonical URL — search engines would index the wrong origin.
 */
function isPublicOrigin(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") return false;
    if (hostname === "localhost" || hostname.endsWith(".local")) return false;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;
    if (hostname.includes(":")) return false; // IPv6 literal
    return hostname.includes(".");
  } catch {
    return false;
  }
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return toOrigin(explicit) ?? FALLBACK_SITE_URL;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    const appOrigin = toOrigin(appUrl);
    if (appOrigin && isPublicOrigin(appOrigin)) return appOrigin;
  }

  return FALLBACK_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Bankybondy";
export const SITE_TWITTER = "@bankybondy";
export const SITE_LOCALE = "es_AR";
export const SITE_ALTERNATE_LOCALES = ["en_US"] as const;

export const OG_IMAGE_PATH = "/opengraph-image";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Bump when public copy changes so sitemap `lastModified` stays honest. */
export const SITE_LAST_UPDATED = new Date("2026-11-10T00:00:00.000Z");

export const SITE_KEYWORDS = [
  "Bankybondy",
  "mutual help network",
  "red de ayuda mutua",
  "barter platform",
  "trueque",
  "skill exchange",
  "intercambio de habilidades",
  "community",
  "comunidad",
  "audio rooms",
  "bonds",
  "vínculos",
] as const;

const SITE_DESCRIPTIONS: Record<"es" | "en", string> = {
  es: "Bankybondy es una red de ayuda mutua: publicá lo que ofrecés y lo que buscás, encontrá personas con intereses en común e intercambiá habilidades, proyectos y tiempo en una comunidad verificada y sin algoritmos.",
  en: "Bankybondy is a mutual-help network: post what you offer and what you need, get matched with people who share your interests, and exchange skills, projects and time in a verified, algorithm-free community.",
};

export type SiteLocale = "es" | "en";

export function normalizeLocale(locale: string): SiteLocale {
  return locale.startsWith("en") ? "en" : "es";
}

export function getSiteDescription(locale: string): string {
  return SITE_DESCRIPTIONS[normalizeLocale(locale)];
}

export function getOpenGraphLocale(locale: string): string {
  return normalizeLocale(locale) === "en" ? "en_US" : SITE_LOCALE;
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

interface BuildMetadataInput {
  /** Title rendered through the root template (`%s | Bankybondy`). */
  title: string;
  /** Skip the root template (used by the home page). */
  absoluteTitle?: boolean;
  description: string;
  /** Route path, e.g. `/about`. Used for the self-referencing canonical. */
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  keywords?: readonly string[];
  /** Keep the page out of the index while still letting link equity flow. */
  noindex?: boolean;
  locale?: string;
}

/**
 * Builds a complete, self-referencing metadata object for a public page.
 * Never returns a page without `og:url`, `og:image` or a canonical.
 */
export function buildMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  image = OG_IMAGE_PATH,
  imageAlt = `${SITE_NAME} — creating reality together`,
  type = "website",
  keywords,
  noindex = false,
  locale,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const ogLocale = locale ? getOpenGraphLocale(locale) : SITE_LOCALE;
  const alternateLocale = SITE_ALTERNATE_LOCALES.filter(
    (item) => item !== ogLocale,
  );

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: {
      canonical: url,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : undefined,
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: ogLocale,
      alternateLocale,
      images: [
        {
          url: imageUrl,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      // Page-level `twitter` replaces the root layout's object wholesale
      // (Next.js merges metadata shallowly), so site/creator must be repeated.
      card: "summary_large_image",
      site: SITE_TWITTER,
      creator: SITE_TWITTER,
      title,
      description,
      images: [imageUrl],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Structured data (schema.org)                                       */
/* ------------------------------------------------------------------ */

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const WEBAPP_ID = `${SITE_URL}/#app`;

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/apple-icon"),
      width: 180,
      height: 180,
    },
    description: SITE_DESCRIPTIONS.es,
    sameAs: [
      "https://www.facebook.com/bankybondy",
      "https://www.instagram.com/bankybondyar",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "bankybondyar@gmail.com",
        telephone: "+5492262615847",
        availableLanguage: ["es", "en"],
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTIONS.es,
    inLanguage: ["es", "en"],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function webApplicationSchema() {
  return {
    "@type": "WebApplication",
    "@id": WEBAPP_ID,
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    inLanguage: ["es", "en"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Global `@graph` injected once in the root layout. */
export function siteGraphSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema(), webApplicationSchema()],
  };
}

export function faqSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function contactPageSchema({
  title,
  description,
  path,
  locale,
}: {
  title: string;
  description: string;
  path: string;
  locale: string;
}) {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${url}#contact-page`,
    url,
    name: title,
    description,
    inLanguage: normalizeLocale(locale),
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
  };
}
