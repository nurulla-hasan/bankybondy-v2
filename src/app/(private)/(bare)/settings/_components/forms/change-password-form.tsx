"use client";

import { useForm } from "@tanstack/react-form";
import { KeyRound, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { FormInput } from "@/components/common/form-input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { mockDelay } from "@/mocks/profile.mock";
import { successToast } from "@/lib/toast";
import { changePasswordSchema } from "@/validations";

export function ChangePasswordForm() {
  const t = useTranslations("Profile");

  const form = useForm({
    defaultValues: { oldPassword: "", newPassword: "", confirmNewPassword: "" },
    validators: { onChange: changePasswordSchema },
    onSubmit: async ({ value }) => {
      await mockDelay(value, 900);
      form.reset();
      successToast(t("password.savedTitle"), t("password.savedDescription"));
    },
  });

  return (
    <section className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <header className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="size-4" aria-hidden />
        </span>
        <div className="space-y-1">
          <h2 className="font-heading text-base font-semibold">
            {t("password.title")}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("password.description")}
          </p>
        </div>
      </header>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-5 sm:max-w-md">
          <FormInput
            form={form}
            name="oldPassword"
            type="password"
            label={t("password.current")}
            autoComplete="current-password"
          />

          <FormInput
            form={form}
            name="newPassword"
            type="password"
            label={t("password.new")}
            autoComplete="new-password"
            description={t("password.minLength")}
          />

          <FormInput
            form={form}
            name="confirmNewPassword"
            type="password"
            label={t("password.confirm")}
            autoComplete="new-password"
          />
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
          {t("password.sessionsHint")}
        </p>

        <DialogFooter>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? t("form.saving") : t("password.update")}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </form>
    </section>
  );
}
