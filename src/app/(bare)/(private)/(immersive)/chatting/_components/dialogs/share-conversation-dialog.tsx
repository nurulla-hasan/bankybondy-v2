"use client";

import { useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ImageIcon, Mic, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { FormInput } from "@/components/common/form-input";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { successToast } from "@/lib/toast";
import { MOCK_TOPIC_ENTRIES } from "../shared/mock-data";


const TOPIC_OPTIONS = MOCK_TOPIC_ENTRIES.map((entry) => ({
  value: entry.key,
  label: entry.topic.name,
}));

interface ShareConversationValues {
  title: string;
  topic: string;
  description: string;
  tags: string;
}

const DEFAULT_VALUES: ShareConversationValues = {
  title: "",
  topic: "",
  description: "",
  tags: "",
};

export function ShareConversationDialog() {
  const t = useTranslations("Chatting");
  const [open, setOpen] = useState(false);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const schema = useMemo(
    () =>
      z.object({
        title: z
          .string()
          .trim()
          .min(3, { error: t("shareFormTitleError") }),
        topic: z.string().min(1, { error: t("shareFormTopicError") }),
        description: z
          .string()
          .trim()
          .min(10, { error: t("shareFormDescriptionError") }),
        tags: z.string(),
      }),
    [t],
  );

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onChange: schema,
    },
    onSubmit: () => {
      publish();
    },
  });

  const reset = () => {
    form.reset();
    setAudioFileName(null);
    setCoverFileName(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const publish = () => {
    handleOpenChange(false);
    successToast(t("shareMockTitle"), t("shareMockDescription"));
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={t("shareTitle")}
      description={t("shareDescription")}
      size="lg"
      actionTrigger={
        <Button size="xl">
          <Mic aria-hidden />
          {t("shareCta")}
        </Button>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <FormInput
          form={form}
          name="title"
          label={t("shareFormTitle")}
          placeholder={t("shareFormTitlePlaceholder")}
          maxLength={120}
        />

        <FormInput
          form={form}
          name="topic"
          label={t("shareFormTopic")}
          type="select"
          options={TOPIC_OPTIONS}
          placeholder={t("shareFormTopicPlaceholder")}
        />

        <FormInput
          form={form}
          name="description"
          label={t("shareFormDescription")}
          type="textarea"
          placeholder={t("shareFormDescriptionPlaceholder")}
          maxLength={400}
        />

        <FormInput
          form={form}
          name="tags"
          label={t("shareFormTags")}
          placeholder={t("shareFormTagsPlaceholder")}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="chatting-audio">{t("shareFormUpload")}</Label>
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted"
            >
              <Upload className="size-5 text-muted-foreground" aria-hidden />
              <span className="max-w-full truncate text-sm font-medium">
                {audioFileName ?? t("shareFormUploadHint")}
              </span>
            </button>
            <Input
              ref={audioInputRef}
              id="chatting-audio"
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(event) =>
                setAudioFileName(event.target.files?.[0]?.name ?? null)
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="chatting-cover">{t("shareFormCover")}</Label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted"
            >
              <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
              <span className="max-w-full truncate text-sm font-medium">
                {coverFileName ?? t("shareFormCoverHint")}
              </span>
            </button>
            <Input
              ref={coverInputRef}
              id="chatting-cover"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) =>
                setCoverFileName(event.target.files?.[0]?.name ?? null)
              }
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("shareFormDurationHint")}
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            {t("shareFormCancel")}
          </Button>
          <Button type="submit">{t("shareFormPublish")}</Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}