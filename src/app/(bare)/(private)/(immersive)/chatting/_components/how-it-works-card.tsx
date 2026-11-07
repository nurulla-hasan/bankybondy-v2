"use client";

import { Bookmark, Headphones, Mic } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STEPS = [
  { key: "howStep1", icon: Headphones },
  { key: "howStep2", icon: Bookmark },
  { key: "howStep3", icon: Mic },
] as const;

interface HowItWorksCardProps {
  className?: string;
}

export function HowItWorksCard({ className }: HowItWorksCardProps) {
  const t = useTranslations("Chatting");

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("howTitle")}</CardTitle>
        <CardDescription>{t("howDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {STEPS.map((step) => (
            <li key={step.key} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <step.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {t(`${step.key}Title`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`${step.key}Description`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}