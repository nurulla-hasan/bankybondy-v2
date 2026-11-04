"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ChevronDown, Handshake, Sparkles, Users } from "lucide-react";
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
import { RelativeTime } from "@/components/common/relative-time";
import { useCreateBondLink } from "@/services";
import { MatchChain } from "./match-chain";
import { MatchCycle } from "./match-cycle";
import { MatchFactors } from "./match-factors";
import { errorToast, successToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { proposeBondSchema, type ProposeBondValues } from "@/validations";
import type { BondMatch, MatchSpecial } from "@/types";

const SPECIAL_DOT: Record<MatchSpecial, string> = {
  gift: "bg-pink-accent",
  openSurprise: "bg-violet-accent",
  doubleSurprise: "bg-pink-accent",
};

export function MatchCard({ match }: { match: BondMatch }) {
  const t = useTranslations("Bonds");
  const createLink = useCreateBondLink();
  const [whyOpen, setWhyOpen] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);

  const proposeForm = useForm({
    defaultValues: { name: "" } as ProposeBondValues,
    validators: {
      onChange: proposeBondSchema,
    },
    onSubmit: ({ value }) => {
      createLink.mutate(
        {
          name: value.name,
          participants: [...new Set(match.participantIds)],
          requestedBonds: match.bondIds,
        },
        {
          onSuccess: () => {
            successToast(
              t("proposeSuccessTitle"),
              t("proposeSuccess", { name: value.name }),
            );
            setProposeOpen(false);
            proposeForm.reset();
          },
          onError: () => {
            errorToast(t("proposeErrorTitle"), t("proposeError"));
          },
        },
      );
    },
  });

  const handleProposeOpenChange = (open: boolean) => {
    setProposeOpen(open);
    if (!open) proposeForm.reset();
  };

  const scoreVariant =
    match.score >= 90 ? "success" : match.score >= 85 ? "info" : "pending";

  return (
    <article className="rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/30">
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

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            {t("membersCount", { count: match.participants.length })}
          </span>
          {match.createdAt ? (
            <>
              <span aria-hidden>·</span>
              <RelativeTime date={match.createdAt} />
            </>
          ) : null}
        </div>
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
                  {([canSubmit, isSubmitting]) => {
                    const isPending = isSubmitting || createLink.isPending;

                    return (
                      <Button type="submit" disabled={!canSubmit || isPending}>
                        {isPending ? t("proposing") : t("propose")}
                      </Button>
                    );
                  }}
                </proposeForm.Subscribe>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {whyOpen && (
        <div className="mt-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:p-5">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-8">
            <MatchCycle
              score={match.score}
              participants={match.participants}
              className="shrink-0"
            />

            {match.factors && (
              <div className="w-full min-w-0 flex-1 space-y-3">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  {t("breakdown")}
                </p>
                <MatchFactors factors={match.factors} />
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
