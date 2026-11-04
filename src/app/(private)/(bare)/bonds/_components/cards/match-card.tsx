"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, ChevronDown, Handshake, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MatchChain } from "./match-chain";
import { successToast } from "@/lib/toast";
import { cn, formatRelativeTime } from "@/lib/utils";
import { proposeBondSchema, type ProposeBondValues } from "@/validations";
import type { BondMatch, MatchSpecial } from "@/types";

const SPECIAL_DOT: Record<MatchSpecial, string> = {
  gift: "bg-pink-accent",
  openSurprise: "bg-violet-accent",
  doubleSurprise: "bg-pink-accent",
};

export function MatchCard({ match }: { match: BondMatch }) {
  const t = useTranslations("Bonds");
  const [whyOpen, setWhyOpen] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);

  const proposeForm = useForm({
    defaultValues: { name: "" } as ProposeBondValues,
    validators: {
      onChange: proposeBondSchema,
    },
    onSubmit: ({ value }) => {
      successToast(
        t("proposeSuccessTitle"),
        t("proposeSuccess", { name: value.name }),
      );
      setProposeOpen(false);
      proposeForm.reset();
    },
  });

  const handleProposeOpenChange = (open: boolean) => {
    setProposeOpen(open);
    if (!open) proposeForm.reset();
  };

  const valueLabel = (value: string) =>
    value === "empty"
      ? t("openGift")
      : value === "surprise"
        ? t("surprise")
        : value;

  const scoreVariant =
    match.score >= 90 ? "success" : match.score >= 85 ? "info" : "pending";

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={scoreVariant}>
            {t("matchScore", { score: match.score })}
          </Badge>

          {match.special && (
            <Badge variant="secondary">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  SPECIAL_DOT[match.special],
                )}
                aria-hidden
              />
              {t(`special.${match.special}`)}
            </Badge>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(match.createdAt)}
        </span>
      </header>

      <MatchChain participants={match.participants} className="mt-4" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <Button
          variant="ghost"
          size="default"
          onClick={() => setWhyOpen((open) => !open)}
          aria-expanded={whyOpen}
        >
          <Sparkles className="size-4 text-primary" aria-hidden />
          {t("whyMatch")}
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300",
              whyOpen && "rotate-180",
            )}
            aria-hidden
          />
        </Button>

        <Dialog open={proposeOpen} onOpenChange={handleProposeOpenChange}>
          <DialogTrigger
            render={
              <Button>
                <Handshake className="size-4" aria-hidden />
                {t("propose")}
              </Button>
            }
          />

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("proposeTitle")}</DialogTitle>
              <DialogDescription>{t("proposeDescription")}</DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void proposeForm.handleSubmit();
              }}
            >
              <proposeForm.Field name="name">
                {(field) => (
                  <div className="grid gap-2 py-2">
                    <Label htmlFor={`bond-name-${match.id}`}>
                      {t("groupName")}
                    </Label>
                    <Input
                      id={`bond-name-${match.id}`}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder={t("groupNamePlaceholder")}
                      maxLength={60}
                    />
                  </div>
                )}
              </proposeForm.Field>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleProposeOpenChange(false)}
                >
                  {t("cancel")}
                </Button>

                <proposeForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? t("submitting") : t("propose")}
                    </Button>
                  )}
                </proposeForm.Subscribe>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {whyOpen && (
        <ul className="mt-3 space-y-2 rounded-xl bg-muted/40 p-4">
          {match.participants.map((participant, index) => {
            const next =
              match.participants[(index + 1) % match.participants.length];

            return (
              <li
                key={participant.id}
                className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
              >
                <ArrowRight
                  className="mt-0.5 size-3.5 shrink-0 text-primary/70"
                  aria-hidden
                />
                {t("whyRow", {
                  from: participant.name,
                  offer: valueLabel(participant.offer),
                  to: next.name,
                })}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
