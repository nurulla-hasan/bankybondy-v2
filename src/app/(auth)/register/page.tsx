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
import { useRegister, useGetAllSkills } from "@/services";
import { successToast, errorToast } from "@/lib/toast";
import { registerSchema, type RegisterSchemaType } from "@/validations";
import { getErrorMessage } from "@/lib/error";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();
  const { data: skillsData } = useGetAllSkills({ limit: 100 });

  const skillOptions = (skillsData?.data?.result || []).map((s) => ({
    label: s.name,
    value: s._id,
  }));

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      gender: undefined,
      dateOfBirth: "",
      address: "",
      bio: "",
      skills: [],
    } as RegisterSchemaType,
    validators: {
      onChange: registerSchema,
    },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name.trim(),
        email: value.email.trim(),
        password: value.password,
        confirmPassword: value.confirmPassword,
        phone: value.phone?.trim() || undefined,
        gender: value.gender || undefined,
        dateOfBirth: value.dateOfBirth?.trim() || undefined,
        address: value.address?.trim() || undefined,
        bio: value.bio?.trim() || undefined,
        skills: value.skills?.length ? value.skills : undefined,
      };


      register(payload, {
        onSuccess: (res) => {
          successToast(
            t("signUpTitle"),
            res?.message || "Registration successful! Please check your email to verify.",
          );
          router.push(`/verify-code?email=${encodeURIComponent(payload.email)}`);
        },
        onError: (err) => {
          errorToast(getErrorMessage(err, "Registration failed. Please try again."));
        },
      });
    },
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("signUpTitle")}
        </CardTitle>
        <CardDescription>
          {t("signUpSubtitle")}
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
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              form={form}
              name="name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
            />

            <FormInput
              form={form}
              name="email"
              label={t("email")}
              type="email"
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
            />
          </div>

          {/* Row 2: Phone & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              form={form}
              name="phone"
              label={`${t("phone")} (${t("optional")})`}
              type="tel"
              placeholder={t("phonePlaceholder")}
              autoComplete="tel"
            />

            <FormInput
              form={form}
              name="gender"
              label={`${t("gender")} (${t("optional")})`}
              type="select"
              placeholder={t("genderPlaceholder")}
              options={[
                { label: t("genderFemale"), value: "FEMALE" },
                { label: t("genderMale"), value: "MALE" },
                { label: t("genderOther"), value: "OTHER" },
              ]}
            />
          </div>

          {/* Row 3: Date of Birth & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              form={form}
              name="dateOfBirth"
              label={`${t("dateOfBirth")} (${t("optional")})`}
              type="date"
            />

            <FormInput
              form={form}
              name="address"
              label={`${t("address")} (${t("optional")})`}
              type="text"
              placeholder={t("addressPlaceholder")}
            />
          </div>

          {/* Row 4: Skills Multi-select */}
          <FormInput
            form={form}
            name="skills"
            label={`${t("skills")} (${t("optional")})`}
            type="multi-select"
            placeholder={t("skillsPlaceholder")}
            options={skillOptions}
          />

          {/* Row 5: Bio */}
          <FormInput
            form={form}
            name="bio"
            label={`${t("bio")} (${t("optional")})`}
            type="textarea"
            placeholder={t("bioPlaceholder")}
          />


          {/* Row 6: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              form={form}
              name="password"
              label={t("password")}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <FormInput
              form={form}
              name="confirmPassword"
              label={t("confirmPassword")}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>


          <Button
            type="submit"
            className="w-full cursor-pointer mt-3"
            size="lg"
            loading={isPending}
            loadingText={t("loading")}
          >
            {t("signUpButton")}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 text-center text-xs border-t pt-4">
        <div>
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-semibold"
          >
            {t("loginLink")}
          </Link>
        </div>
      </CardFooter>

    </Card>
  );
}

