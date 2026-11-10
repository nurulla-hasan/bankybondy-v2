import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Public pages stay crawlable; authenticated areas, auth flows and payment
 * result screens are kept out of the index. `/_next` is intentionally NOT
 * disallowed — Googlebot needs the JS/CSS to render pages.
 */
const DISALLOWED_PATHS = [
  "/profile",
  "/settings",
  "/bonds",
  "/people",
  "/chatting",
  "/messages",
  "/friends",
  "/subscriptions",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-code",
  "/success",
  "/cancel",
  "/api/",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...DISALLOWED_PATHS],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
