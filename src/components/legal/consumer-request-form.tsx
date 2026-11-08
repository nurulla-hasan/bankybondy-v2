"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { CheckCircle2 } from "lucide-react";

import { FormInput } from "@/components/common/form-input";
import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateConsumerRequest } from "@/services";
import type { ConsumerRequestResult, ConsumerRequestType } from "@/types";
import {
  consumerRequestSchema,
  type ConsumerRequestSchemaType,
} from "@/validations";

function formatArgentinaDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function ConsumerRequestForm({ tipo }: { tipo: ConsumerRequestType }) {
  const t = useTranslations("Legal");
  const locale = useLocale();
  const isCancel = tipo === "baja";
  const { mutate, isPending } = useCreateConsumerRequest();
  const [result, setResult] = useState<
    (ConsumerRequestResult & { email: string }) | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: "",
      email: "",
      medioPago: "",
      operacion: "",
      comentario: "",
    } as ConsumerRequestSchemaType,
    validators: {
      onChange: consumerRequestSchema,
    },
    onSubmit: ({ value }) => {
      setError(null);
      const email = value.email.trim();

      mutate(
        {
          tipo,
          nombre: value.nombre.trim(),
          email,
          idioma: locale === "en" ? "en" : "es",
          ...(value.medioPago ? { medioPago: value.medioPago } : {}),
          ...(value.operacion?.trim() ? { operacion: value.operacion.trim() } : {}),
          ...(value.comentario?.trim()
            ? { comentario: value.comentario.trim() }
            : {}),
        },
        {
          onSuccess: (response) => {
            setResult({ ...response.data, email });
          },
          onError: () => {
            setError(t("consumidor.error"));
          },
        }
      );
    },
  });

  return (
    <PageWrapper className="space-y-8">
      <SectionHeading
        as="h1"
        alignment="center"
        variant="plain"
        title={
          isCancel
            ? t("consumidor.tituloBaja")
            : t("consumidor.tituloArrepentimiento")
        }
        description={
          isCancel
            ? t("consumidor.introBaja")
            : t("consumidor.introArrepentimiento")
        }
        descriptionClassName="mt-3"
      />

      <div className="mx-auto w-full max-w-xl">
        <Card>
          <CardContent className="pt-2">
            {result ? (
              <div className="space-y-4 text-center" role="status">
                <CheckCircle2
                  className="mx-auto size-10 text-primary"
                  aria-hidden
                />
                <h2 className="text-xl font-semibold">
                  {t("consumidor.listoTitulo")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("consumidor.listoCodigo")}
                </p>
                <p className="select-all rounded-lg bg-muted py-3 text-2xl font-bold tracking-wider text-foreground">
                  {result.codigo}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("consumidor.listoFecha", {
                    fecha: formatArgentinaDate(result.fecha, locale),
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("consumidor.listoMail", { email: result.email })}
                </p>
                <p className="text-sm text-foreground">
                  {isCancel
                    ? t("consumidor.listoDespuesBaja")
                    : t("consumidor.listoDespuesArrepentimiento")}
                </p>
              </div>
            ) : (
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
                  name="nombre"
                  label={t("consumidor.nombre")}
                  autoComplete="name"
                  maxLength={100}
                />
                <FormInput
                  form={form}
                  name="email"
                  label={
                    isCancel
                      ? t("consumidor.emailBaja")
                      : t("consumidor.emailArrepentimiento")
                  }
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                />

                {!isCancel ? (
                  <>
                    <FormInput
                      form={form}
                      name="medioPago"
                      type="select"
                      label={t("consumidor.medioPago")}
                      placeholder="—"
                      options={[
                        { label: "—", value: "" },
                        { label: "PayPal", value: "paypal" },
                        { label: "MercadoPago", value: "mercadopago" },
                        { label: t("consumidor.otro"), value: "otro" },
                      ]}
                    />
                    <FormInput
                      form={form}
                      name="operacion"
                      label={t("consumidor.operacion")}
                      maxLength={100}
                    />
                  </>
                ) : null}

                <FormInput
                  form={form}
                  name="comentario"
                  label={t("consumidor.comentario")}
                  type="textarea"
                  maxLength={2000}
                />

                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  loading={isPending}
                  loadingText={t("consumidor.enviando")}
                >
                  {t("consumidor.enviar")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">
          {t("consumidor.atencion")}
        </p>
      </div>
    </PageWrapper>
  );
}
