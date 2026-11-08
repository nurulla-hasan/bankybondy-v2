"use client";

import { useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";

import { FormInput } from "@/components/common/form-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { errorToast, successToast } from "@/lib/toast";
import { useSendContactMessage } from "@/services";
import { contactSchema, type ContactSchemaType } from "@/validations";

export function ContactForm() {
  const t = useTranslations("Legal");
  const { mutate, isPending } = useSendContactMessage();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    } as ContactSchemaType,
    validators: {
      onChange: contactSchema,
    },
    onSubmit: ({ value }) => {
      mutate(
        {
          name: value.name.trim(),
          email: value.email.trim(),
          // The backend requires the field to be present; empty is accepted.
          phone: (value.phone ?? "").trim(),
          message: value.message.trim(),
        },
        {
          onSuccess: () => {
            successToast(t("contact.successTitle"), t("contact.success"));
            form.reset();
          },
          onError: () => {
            errorToast(t("contact.error"));
          },
        }
      );
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {t("contact.formTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FormInput
            form={form}
            name="name"
            label={t("contact.name")}
            placeholder={t("contact.namePlaceholder")}
            autoComplete="name"
            maxLength={100}
          />
          <FormInput
            form={form}
            name="email"
            label={t("contact.email")}
            type="email"
            placeholder={t("contact.emailPlaceholder")}
            autoComplete="email"
            maxLength={254}
          />
          <FormInput
            form={form}
            name="phone"
            label={t("contact.phone")}
            type="tel"
            placeholder={t("contact.phonePlaceholder")}
            autoComplete="tel"
            maxLength={40}
          />
          <FormInput
            form={form}
            name="message"
            label={t("contact.message")}
            type="textarea"
            placeholder={t("contact.messagePlaceholder")}
            maxLength={5000}
          />

          <Button
            type="submit"
            className="w-full"
            loading={isPending}
            loadingText={t("contact.sending")}
          >
            {t("contact.send")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
