"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight, KeyRound, ShieldAlert } from "lucide-react";

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
import { useResetPassword } from "@/services";
import { successToast, errorToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/error";
import { resetPasswordSchema, type ResetPasswordSchemaType } from "@/validations";

function ResetPasswordContent() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim();

  const { mutate: resetPassword, isPending } = useResetPassword();

  const form = useForm({
    defaultValues: {
      email,
      newPassword: "",
      confirmPassword: "",
    } as ResetPasswordSchemaType,
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: ({ value }) => {
      if (!email) {
        errorToast("Missing recovery email. Please request a new reset code.");
        return;
      }

      resetPassword(
        {
          email,
          password: value.newPassword,
          newPassword: value.newPassword,
          confirmPassword: value.confirmPassword,
        },
        {
          onSuccess: () => {
            successToast(
              t("passwordResetToast"),
              t("resetPasswordSuccess")
            );
            router.replace("/login");
          },
          onError: (err) => {
            errorToast(getErrorMessage(err, "Failed to reset password."));
          },
        }
      );
    },
  });

  if (!email) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Invalid Recovery Session
          </CardTitle>
          <CardDescription>
            An email address is required to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            type="button"
            className="w-full cursor-pointer"
            size="lg"
            onClick={() => router.push("/forgot-password")}
          >
            Request Reset Code
            <ArrowRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            size="lg"
            onClick={() => router.push("/login")}
          >
            <ArrowLeft className="size-4" />
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("resetPasswordTitle")}
        </CardTitle>
        <CardDescription>
          {t("resetPasswordSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4 rounded-xl border border-border/60 bg-muted/40 p-3 text-center">
          <span className="text-xs text-muted-foreground block">
            Resetting password for
          </span>
          <span className="text-sm font-semibold text-foreground tracking-tight mt-0.5 block break-all">
            {email}
          </span>
        </div>

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
            name="newPassword"
            label={t("newPassword")}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <FormInput
            form={form}
            name="confirmPassword"
            label={t("confirmNewPassword")}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            className="w-full cursor-pointer mt-2"
            size="lg"
            loading={isPending}
            loadingText={t("loading")}
          >
            {t("resetPasswordButton")}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center text-xs">
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

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}
