"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { FormInput } from "@/components/common/form-input";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { mockDelay } from "@/mocks/profile.mock";
import { successToast } from "@/lib/toast";
import { deleteAccountSchema } from "@/validations";

export function DeleteAccountCard() {
  const t = useTranslations("Profile");
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { password: "", confirmText: "" },
    validators: { onChange: deleteAccountSchema },
    onSubmit: async ({ value }) => {
      await mockDelay(value, 900);
      setOpen(false);
      form.reset();
      successToast(t("danger.mockTitle"), t("danger.mockDescription"));
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) form.reset();
  };

  return (
    <section className="space-y-4 rounded-2xl bg-destructive/5 p-5 ring-1 ring-destructive/20 sm:p-6">
      <header className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-4" aria-hidden />
        </span>
        <div className="space-y-1">
          <h2 className="font-heading text-base font-semibold">
            {t("danger.title")}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("danger.description")}
          </p>
        </div>
      </header>

      <ul className="ml-4 list-disc space-y-1 text-xs leading-5 text-muted-foreground">
        <li>{t("danger.consequence1")}</li>
        <li>{t("danger.consequence2")}</li>
        <li>{t("danger.consequence3")}</li>
      </ul>

      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        size="sm"
        title={t("danger.confirmTitle")}
        description={t("danger.confirmDescription")}
        actionTrigger={
          <Button variant="destructive">
            <TriangleAlert className="size-4" aria-hidden />
            {t("danger.action")}
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
            name="password"
            type="password"
            label={t("danger.password")}
            autoComplete="current-password"
          />

          <FormInput
            form={form}
            name="confirmText"
            label={t("danger.confirmPhrase")}
            placeholder="DELETE"
            autoComplete="off"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("form.cancel")}
            </Button>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? t("form.saving") : t("danger.action")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </Modal>
    </section>
  );
}
