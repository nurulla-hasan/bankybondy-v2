"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import { useForgotPassword } from "@/services";
import { successToast, errorToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/error";
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from "@/validations";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    } as ForgotPasswordSchemaType,
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: ({ value }) => {
      const email = value.email.trim();
      forgotPassword(
        { email },
        {
          onSuccess: (res) => {
            successToast(
              t("checkEmailToast"),
              res?.message || "If the account exists, a verification code was sent to your email."
            );
            router.push(`/verify-code?type=reset-password&email=${encodeURIComponent(email)}`);
          },
          onError: (err) => {
            errorToast(getErrorMessage(err, "Failed to send reset code. Please try again."));
          },
        }
      );
    },
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("forgotPasswordTitle")}
        </CardTitle>
        <CardDescription>
          {t("forgotPasswordSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FormInput
            form={form}
            name="email"
            label={t("email")}
            type="email"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isPending}
            loadingText={t("loading")}
          >
            {t("getCodeButton")}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 text-center text-xs">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t("backToLogin")}
        </Link>
      </CardFooter>
    </Card>
  );
}
