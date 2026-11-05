"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Gift, Globe, MapPin, Plus, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/common/form-input";
import { useCreateBondRequest } from "@/services";
import { successToast } from "@/lib/toast";
import { createBondSchema, type CreateBondValues } from "@/validations";
import { cn } from "@/lib/utils";

function getFieldError(errors: unknown[] | undefined): string | undefined {
  if (!errors?.length) return undefined;

  const first = errors[0];
  if (typeof first === "string") return first;

  return (first as { message?: string })?.message;
}

function WildcardChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-300",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function BondValueField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  const t = useTranslations("Bonds");
  const isWildcard = value === "empty" || value === "surprise";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {isWildcard ? (
        <div className="flex h-9 items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            {value === "empty" ? (
              <Gift className="size-4 text-pink-accent" aria-hidden />
            ) : (
              <Sparkles className="size-4 text-violet-accent" aria-hidden />
            )}
            {value === "empty" ? t("openGift") : t("surprise")}
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={t("clear")}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          maxLength={120}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <WildcardChip
          active={value === "empty"}
          onClick={() => onChange(value === "empty" ? "" : "empty")}
          icon={<Gift className="size-3.5" aria-hidden />}
          label={t("openGift")}
        />
        <WildcardChip
          active={value === "surprise"}
          onClick={() => onChange(value === "surprise" ? "" : "surprise")}
          icon={<Sparkles className="size-3.5" aria-hidden />}
          label={t("surprise")}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function CreateBondDialog() {
  const t = useTranslations("Bonds");
  const createRequest = useCreateBondRequest();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      offer: "",
      want: "",
      description: "",
      modality: "physical",
      radiusKm: 20,
    } as CreateBondValues,
    validators: {
      onChange: createBondSchema,
    },
    onSubmit: ({ value }) => {
      createRequest.mutate(value, {
        onSuccess: () => {
          successToast(t("createSuccessTitle"), t("createSuccess"));
          form.reset();
          setOpen(false);
        },
      });
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) form.reset();
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={t("newBond")}
      size="lg"
      description={t("createDescription")}
      actionTrigger={
        <Button>
          <Plus aria-hidden />
          {t("newBond")}
        </Button>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="modality">
          {(field) => (
            <div className="space-y-2">
              <Label>{t("modalityLabel")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  className="w-full"
                  variant={
                    field.state.value === "physical" ? "default" : "outline"
                  }
                  onClick={() => field.handleChange("physical")}
                >
                  <MapPin className="size-4" aria-hidden />
                  {t("modalityPhysical")}
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  variant={
                    field.state.value === "online" ? "default" : "outline"
                  }
                  onClick={() => field.handleChange("online")}
                >
                  <Globe className="size-4" aria-hidden />
                  {t("modalityOnline")}
                </Button>
              </div>
            </div>
          )}
        </form.Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="offer">
            {(field) => (
              <BondValueField
                label={t("give")}
                value={field.state.value}
                onChange={field.handleChange}
                placeholder={t("offerPlaceholder")}
                error={getFieldError(field.state.meta.errors as unknown[])}
              />
            )}
          </form.Field>

          <form.Field name="want">
            {(field) => (
              <BondValueField
                label={t("want")}
                value={field.state.value}
                onChange={field.handleChange}
                placeholder={t("wantPlaceholder")}
                error={getFieldError(field.state.meta.errors as unknown[])}
              />
            )}
          </form.Field>
        </div>

        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Sparkles
            className="mt-0.5 size-3.5 shrink-0 text-primary/70"
            aria-hidden
          />
          {t("wildcardHint")}
        </p>

        <FormInput
          form={form}
          name="description"
          type="textarea"
          label={t("descriptionLabel")}
          placeholder={t("descriptionPlaceholder")}
          maxLength={300}
        />

        <form.Subscribe selector={(state) => state.values.modality}>
          {(modality) =>
            modality === "physical" ? (
              <FormInput
                form={form}
                name="radiusKm"
                type="number"
                label={t("radiusLabel")}
                min={1}
                max={20000}
              />
            ) : null
          }
        </form.Subscribe>

        <DialogFooter>
          <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
            {t("createHint")}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            {t("cancel")}
          </Button>

          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button
                type="submit"
                disabled={!canSubmit}
                loading={createRequest.isPending}
                loadingText={t("submitting")}
              >
                {t("createButton")}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </form>
    </Modal>
  );
}
