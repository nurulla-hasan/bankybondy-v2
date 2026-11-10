import type { MetadataRoute } from "next";

import { SITE_LAST_UPDATED, absoluteUrl } from "@/lib/seo";

/**
 * Only public, indexable routes belong here. Authenticated pages are excluded
 * both here and in robots.ts, and carry `noindex` metadata as a second guard.
 */
const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/donate", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/arrepentimiento", changeFrequency: "yearly", priority: 0.2 },
  { path: "/baja-de-servicio", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
