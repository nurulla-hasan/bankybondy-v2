"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { FormInput } from "@/components/common/form-input";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { mockDelay } from "@/mocks/profile.mock";
import { successToast } from "@/lib/toast";
import { changePasswordSchema } from "@/validations";

export function ChangePasswordDialog() {
  const t = useTranslations("Profile");
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { oldPassword: "", newPassword: "", confirmNewPassword: "" },
    validators: { onChange: changePasswordSchema },
    onSubmit: async ({ value }) => {
      await mockDelay(value, 900);
      setOpen(false);
      form.reset();
      successToast(t("password.savedTitle"), t("password.savedDescription"));
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
      title={t("password.title")}
      description={t("password.description")}
      actionTrigger={
        <Button variant="outline">
          <KeyRound className="size-4" aria-hidden />
          {t("password.action")}
        </Button>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
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

        <p className="rounded-xl bg-muted/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          {t("password.sessionsHint")}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("form.cancel")}
          </Button>

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
    </Modal>
  );
}
