import type { MetadataRoute } from "next";

import { SITE_NAME, getSiteDescription } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Mutual-help network`,
    short_name: SITE_NAME,
    description: getSiteDescription("es"),
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es",
    dir: "ltr",
    categories: ["social", "lifestyle", "productivity"],
    background_color: "#ffffff",
    theme_color: "#12162b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
