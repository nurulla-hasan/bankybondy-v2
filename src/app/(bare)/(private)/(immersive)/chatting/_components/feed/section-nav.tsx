"use client";

import { Bookmark, Compass, Flame, Headphones, LayoutList } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type FeedSection =
  | "recent"
  | "trending"
  | "mostPlayed"
  | "favorites"
  | "myContent";

const SECTIONS = [
  { key: "recent", icon: Compass },
  { key: "trending", icon: Flame },
  { key: "mostPlayed", icon: Headphones },
  { key: "favorites", icon: Bookmark },
  { key: "myContent", icon: LayoutList },
] as const;

export const FEED_SECTIONS = [
  "recent",
  "trending",
  "mostPlayed",
] as const satisfies readonly FeedSection[];

export function isFeedSection(
  section: FeedSection,
): section is (typeof FEED_SECTIONS)[number] {
  return (FEED_SECTIONS as readonly FeedSection[]).includes(section);
}

export function sectionLabelKey(section: FeedSection) {
  return `section${section.charAt(0).toUpperCase()}${section.slice(1)}`;
}

interface SectionNavProps {
  value: FeedSection;
  onChange: (section: FeedSection) => void;
}

export function SectionNav({ value, onChange }: SectionNavProps) {
  const t = useTranslations("Chatting");

  return (
    <>
      <nav aria-label={t("sectionsLabel")} className="lg:hidden">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {SECTIONS.map((section) => (
            <Button
              key={section.key}
              variant={value === section.key ? "default" : "outline"}
              aria-pressed={value === section.key}
              onClick={() => onChange(section.key)}
            >
              <section.icon aria-hidden />
              {t(sectionLabelKey(section.key))}
            </Button>
          ))}
        </div>
      </nav>

      <nav
        aria-label={t("sectionsLabel")}
        className="hidden lg:block"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("sectionsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {SECTIONS.map((section) => (
              <Button
                key={section.key}
                variant={value === section.key ? "secondary" : "ghost"}
                className="w-full justify-start whitespace-nowrap"
                aria-pressed={value === section.key}
                onClick={() => onChange(section.key)}
              >
                <section.icon aria-hidden />
                {t(sectionLabelKey(section.key))}
              </Button>
            ))}
          </CardContent>
        </Card>
      </nav>
    </>
  );
}
