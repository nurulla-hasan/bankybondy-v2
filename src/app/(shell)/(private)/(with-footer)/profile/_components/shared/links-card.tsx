"use client";

import { ExternalLink, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LinksCardProps {
  socialLinks?: string[];
  title?: string;
}

function safeHref(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

function linkLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function LinksCard({ socialLinks, title }: LinksCardProps) {
  const t = useTranslations("Profile");
  const links = (socialLinks ?? []).flatMap((url) => {
    const href = safeHref(url);
    return href ? [{ href, url }] : [];
  });

  if (!links.length) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{title ?? t("detail.links")}</CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {links.map(({ href, url }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2.5 text-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate">{linkLabel(url)}</span>
                </span>
                <ExternalLink
                  className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
