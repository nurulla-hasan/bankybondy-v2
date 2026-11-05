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
import { useCreateBondLink } from "@/services";
import { MatchChain, type BondParticipant } from "./match-chain";
import { MatchCycle } from "./match-cycle";
import { MatchFactors } from "./match-factors";
import { errorToast, successToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { proposeBondSchema, type ProposeBondValues } from "@/validations";
import type { RawBondMatch } from "@/types";

const SPECIAL_DOT = {
  gift: "bg-pink-accent",
  openSurprise: "bg-violet-accent",
  doubleSurprise: "bg-pink-accent",
} as const;

type MatchSpecial = keyof typeof SPECIAL_DOT;

const SURPRISE_TOKEN = "surprise";

const normalizeToken = (value?: string) => (value ?? "").trim().toLowerCase();

const toPercent = (value: number) =>
  Math.round(Math.max(0, Math.min(1, value)) * 100);

function resolveParticipants(match: RawBondMatch): BondParticipant[] {
  return match.matchRequest.map((entry) => {
    const user =
      entry.user && typeof entry.user === "object" ? entry.user : undefined;
    const reputation =
      typeof user?.reputation?.avg === "number" &&
      typeof user?.reputation?.count === "number"
        ? { avg: user.reputation.avg, count: user.reputation.count }
        : undefined;

    return {
      id: user?._id ?? entry._id,
      name: user?.name ?? "",
      avatarUrl: user?.profile_image,
      reputation,
      offer: entry.offer,
      want: entry.want,
      offerColor: entry.offerColor,
      wantColor: entry.wantColor,
    };
  });
}

function resolveSpecial(
  match: RawBondMatch,
  participants: BondParticipant[],
): MatchSpecial | undefined {
  if (match.type === "empty" || match.isFullEmpty) return "gift";
  if (match.type !== "surprise") return undefined;

  const hasSurprise = participants.some(
    (participant) =>
      normalizeToken(participant.offer) === SURPRISE_TOKEN ||
      normalizeToken(participant.want) === SURPRISE_TOKEN,
  );
  if (!hasSurprise) return undefined;

  // Double surprise = a pair where one side's want and the previous side's
  // offer are both the 'surprise' token (same cycle rule as the backend).
  const isDouble = participants.some((participant, index) => {
    const previous =
      participants[(index - 1 + participants.length) % participants.length];

    return (
      normalizeToken(participant.want) === SURPRISE_TOKEN &&
      normalizeToken(previous.offer) === SURPRISE_TOKEN
    );
  });

  return isDouble ? "doubleSurprise" : "openSurprise";
}

export function MatchCard({ match }: { match: RawBondMatch }) {
  const t = useTranslations("Bonds");
  const createLink = useCreateBondLink();
  const [whyOpen, setWhyOpen] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);

  const participants = resolveParticipants(match);
  const bondIds = match.matchRequest.map((entry) => entry._id);
  const participantIds = [...new Set(participants.map((p) => p.id))];
  const matchId = [...bondIds].sort().join("|");
  const score = toPercent(match.matchScore);
  const special = resolveSpecial(match, participants);

  const proposeForm = useForm({
    defaultValues: { name: "" } as ProposeBondValues,
    validators: {
      onChange: proposeBondSchema,
    },
    onSubmit: ({ value }) => {
      createLink.mutate(
        {
          name: value.name,
          participants: participantIds,
          requestedBonds: bondIds,
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

  const scoreVariant = score >= 90 ? "success" : score >= 85 ? "info" : "pending";

  return (
    <article className="rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/30">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={scoreVariant}>{t("matchScore", { score })}</Badge>

          {special && (
            <Badge variant="secondary">
              <span
                className={cn("size-1.5 rounded-full", SPECIAL_DOT[special])}
                aria-hidden
              />
              {t(`special.${special}`)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            {t("membersCount", { count: participants.length })}
          </span>
        </div>
      </header>

      <MatchChain participants={participants} className="mt-4" />

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
                    <Label htmlFor={`bond-name-${matchId}`}>
                      {t("groupName")}
                    </Label>
                    <Input
                      id={`bond-name-${matchId}`}
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
                      <Button
                        type="submit"
                        disabled={!canSubmit}
                        loading={isPending}
                        loadingText={t("proposing")}
                      >
                        {t("propose")}
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
              score={score}
              participants={participants}
              className="shrink-0"
            />

            <div className="w-full min-w-0 flex-1 space-y-3">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {t("breakdown")}
              </p>
              <MatchFactors scoreParts={match.scoreParts} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
