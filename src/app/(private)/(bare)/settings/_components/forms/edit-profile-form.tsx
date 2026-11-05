"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Camera, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { FormInput } from "@/components/common/form-input";
import { ImageCropDialog } from "@/components/common/image-crop-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_SKILLS, mockDelay } from "@/mocks/profile.mock";
import { successToast } from "@/lib/toast";
import { getInitials } from "@/lib/utils";
import { PROFILE_LIMITS, profileSchema } from "@/validations";
import type { MyProfile } from "@/types";

const SKILL_OPTIONS = MOCK_SKILLS.map((skill) => ({
  label: skill.name,
  value: skill._id,
}));

function toFormValues(profile: MyProfile) {
  return {
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    gender: profile.gender ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    address: profile.address ?? "",
    bio: profile.bio ?? "",
    skills: (profile.skills ?? []).map((skill) => skill._id),
    socialLinks: profile.socialLinks?.length ? [...profile.socialLinks] : [""],
  };
}

function useObjectUrl() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return [url, setUrl] as const;
}

export function EditProfileForm({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Profile");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useObjectUrl();
  const [coverPreview, setCoverPreview] = useObjectUrl();

  const form = useForm({
    defaultValues: toFormValues(profile),
    validators: { onChange: profileSchema },
    onSubmit: async ({ value }) => {
      await mockDelay(value, 900);
      form.reset(value);
      successToast(t("form.savedTitle"), t("form.savedDescription"));
    },
  });

  const handleAvatarFile = (file: File | undefined) => {
    if (!file) return;
    setCropSource(URL.createObjectURL(file));
  };

  const handleCropped = (cropped: File) => {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(null);
    setAvatarPreview(URL.createObjectURL(cropped));
  };

  const handleCoverFile = (file: File | undefined) => {
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="relative h-32 bg-linear-to-br from-primary/25 via-primary/10 to-transparent sm:h-40">
          {coverPreview || profile.cover_image ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${coverPreview ?? profile.cover_image}")`,
              }}
            />
          ) : null}

          <div className="absolute inset-x-3 bottom-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => coverInputRef.current?.click()}
            >
              <ImagePlus className="size-3.5" aria-hidden />
              {coverPreview || profile.cover_image
                ? t("form.changeCover")
                : t("form.addCover")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-5">
          <div className="-mt-16 shrink-0">
            <Avatar size="xl" className="size-20 ring-4 ring-card shadow-lg sm:size-24">
              <AvatarImage src={avatarPreview ?? profile.profile_image} alt={profile.name} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-heading text-base font-semibold">{profile.name}</p>
            <p className="text-xs leading-5 text-muted-foreground">
              {t("form.photoHint")}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => avatarInputRef.current?.click()}
            >
              <Camera className="size-4" aria-hidden />
              {avatarPreview || profile.profile_image
                ? t("form.changePhoto")
                : t("form.addPhoto")}
            </Button>

            {avatarPreview ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAvatarPreview(null)}
              >
                <Trash2 className="size-4" aria-hidden />
                {t("form.removePhoto")}
              </Button>
            ) : null}
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleAvatarFile(event.target.files?.[0])}
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleCoverFile(event.target.files?.[0])}
          />
        </div>
      </section>

      <ImageCropDialog
        open={Boolean(cropSource)}
        imageSrc={cropSource}
        onClose={() => {
          if (cropSource) URL.revokeObjectURL(cropSource);
          setCropSource(null);
        }}
        onCropComplete={handleCropped}
      />

      <section className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <h2 className="font-heading text-base font-semibold">{t("form.identity")}</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            form={form}
            name="name"
            label={t("form.name")}
            placeholder={t("form.namePlaceholder")}
            autoComplete="name"
            maxLength={PROFILE_LIMITS.nameMax}
          />

          <div className="space-y-2">
            <Label htmlFor="profile-email">{t("form.email")}</Label>
            <Input id="profile-email" value={profile.email ?? ""} readOnly disabled />
            <p className="text-xs leading-5 text-muted-foreground">
              {t("emailLocked")}
            </p>
          </div>

          <FormInput
            form={form}
            name="phone"
            label={t("form.phone")}
            type="tel"
            placeholder={t("form.phonePlaceholder")}
            autoComplete="tel"
            maxLength={PROFILE_LIMITS.phoneMax}
          />

          <FormInput
            form={form}
            name="address"
            label={t("form.location")}
            placeholder={t("form.locationPlaceholder")}
            maxLength={PROFILE_LIMITS.addressMax}
          />

          <FormInput
            form={form}
            name="gender"
            type="select"
            label={t("form.gender")}
            placeholder={t("form.genderUnspecified")}
            options={[
              { value: "", label: t("form.genderUnspecified") },
              { value: "MALE", label: t("form.genderMale") },
              { value: "FEMALE", label: t("form.genderFemale") },
            ]}
          />

          <FormInput
            form={form}
            name="dateOfBirth"
            type="date"
            label={t("form.birthdate")}
            placeholder={t("form.birthdatePlaceholder")}
          />
        </div>
      </section>

      <section className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <h2 className="font-heading text-base font-semibold">{t("form.story")}</h2>

        <FormInput
          form={form}
          name="bio"
          type="textarea"
          label={t("form.bio")}
          placeholder={t("form.bioPlaceholder")}
          maxLength={PROFILE_LIMITS.bioMax}
          description={t("form.bioModerated")}
        />

        <FormInput
          form={form}
          name="skills"
          type="multi-select"
          label={t("form.skills")}
          placeholder={t("form.skillsPlaceholder")}
          options={SKILL_OPTIONS}
          description={t("form.skillsHint", { max: PROFILE_LIMITS.skillsMax })}
        />
      </section>

      <section className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-heading text-base font-semibold">{t("form.links")}</h2>
            <p className="text-xs leading-5 text-muted-foreground">
              {t("form.linksHint", { max: PROFILE_LIMITS.linksMax })}
            </p>
          </div>
        </div>

        <form.Field name="socialLinks">
          {(field) => (
            <div className="space-y-2">
              {field.state.value.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={link}
                    inputMode="url"
                    placeholder="https://"
                    aria-label={t("form.linkAria", { index: index + 1 })}
                    onChange={(event) =>
                      field.handleChange(
                        field.state.value.map((current, position) =>
                          position === index ? event.target.value : current,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("form.removeLink")}
                    onClick={() =>
                      field.handleChange(
                        field.state.value.filter((_, position) => position !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={field.state.value.length >= PROFILE_LIMITS.linksMax}
                onClick={() => field.handleChange([...field.state.value, ""])}
              >
                <Plus className="size-3.5" aria-hidden />
                {t("form.addLink")}
              </Button>

              {field.state.meta.errors.length ? (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border/70 bg-background/85 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) =>
            isDirty ? (
              <p className="mr-auto text-xs font-medium text-amber-accent">
                {t("form.unsaved")}
              </p>
            ) : (
              <p className="mr-auto text-xs text-muted-foreground">
                {t("form.allSaved")}
              </p>
            )
          }
        </form.Subscribe>

        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) =>
            isDirty ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setAvatarPreview(null);
                  setCoverPreview(null);
                }}
              >
                {t("form.discard")}
              </Button>
            ) : null
          }
        </form.Subscribe>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
        >
          {([canSubmit, isSubmitting, isDirty]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting || !isDirty}>
              {isSubmitting ? t("form.saving") : t("form.save")}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
