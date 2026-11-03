"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { ArrowRight } from "lucide-react";

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
import { useLogin } from "@/services";
import { successToast, errorToast } from "@/lib/toast";
import { loginSchema, type LoginSchemaType } from "@/validations";
import { getErrorMessage } from "@/lib/error";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginSchemaType,
    validators: {
      onChange: loginSchema,
    },
    onSubmit: ({ value }) => {
      login(value, {
        onSuccess: () => {
          successToast(t("loginTitle"), t("loginSubtitle"));
          router.replace("/");
        },
        onError: (err) => {
          errorToast(getErrorMessage(err, "Login failed"));
        },
      });
    },
  });

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("loginTitle")}
        </CardTitle>
        <CardDescription>
          {t("loginSubtitle")}
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

          <FormInput
            form={form}
            name="password"
            label={t("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              {t("forgotPasswordLink")}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            size="lg"
            loading={isPending}
            loadingText={t("loading")}
          >
            {t("loginButton")}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 text-center text-xs border-t pt-4">
        <div>
          {t("signUpSubtitle")}{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-semibold"
          >
            {t("signUpLink")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

