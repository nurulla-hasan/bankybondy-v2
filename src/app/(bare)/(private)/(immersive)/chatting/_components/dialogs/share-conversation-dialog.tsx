"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ImageIcon, Loader2, Mic, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { FormInput } from "@/components/common/form-input";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/error";
import { errorToast, successToast } from "@/lib/toast";
import {
  useAudioModerationStatus,
  useCreateAudio,
} from "@/services/hooks/audio.hook";
import type { AudioModerationStatus, RawAudioTopicWithCount } from "@/types";

import {
  isAcceptedAudioFile,
  isAcceptedImageFile,
  readAudioDuration,
} from "../shared/audio-file";

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

interface ShareConversationDialogProps {
  topics: readonly RawAudioTopicWithCount[];
}

export function ShareConversationDialog({
  topics,
}: ShareConversationDialogProps) {
  const t = useTranslations("Chatting");
  const [open, setOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [moderationAudioId, setModerationAudioId] = useState<string | null>(
    null,
  );
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const handledStatusRef = useRef<AudioModerationStatus | null>(null);

  const createAudio = useCreateAudio();
  const moderation = useAudioModerationStatus(moderationAudioId);

  const topicOptions = useMemo(
    () => topics.map((topic) => ({ value: topic._id, label: topic.name })),
    [topics],
  );

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
    onSubmit: async ({ value }) => {
      await publish(value);
    },
  });

  const reset = () => {
    form.reset();
    setAudioFile(null);
    setCoverFile(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const publish = async (value: ShareConversationValues) => {
    if (!audioFile) {
      errorToast(t("shareAudioRequired"));
      return;
    }

    if (!coverFile) {
      errorToast(t("shareCoverRequired"));
      return;
    }

    if (!isAcceptedAudioFile(audioFile)) {
      errorToast(t("shareInvalidAudio"));
      return;
    }

    if (!isAcceptedImageFile(coverFile)) {
      errorToast(t("shareInvalidCover"));
      return;
    }

    let duration: number;
    try {
      duration = await readAudioDuration(audioFile);
    } catch {
      errorToast(t("shareDurationError"));
      return;
    }

    const tags = value.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    createAudio.mutate(
      {
        input: {
          title: value.title.trim(),
          description: value.description.trim(),
          audioTopic: value.topic,
          tags,
          duration: Math.round(duration),
        },
        audio: audioFile,
        cover: coverFile,
      },
      {
        onSuccess: (response) => {
          handleOpenChange(false);
          successToast(t("shareProcessing"));

          if (response.data?._id) {
            handledStatusRef.current = null;
            setModerationAudioId(response.data._id);
          }
        },
        onError: (error) => {
          errorToast(
            t("shareFailed"),
            getErrorMessage(error, t("shareFailedDescription")),
          );
        },
      },
    );
  };

  const moderationStatus = moderation.data?.moderationStatus;

  useEffect(() => {
    if (!moderationStatus || handledStatusRef.current === moderationStatus) {
      return;
    }

    handledStatusRef.current = moderationStatus;

    if (moderationStatus === "ready") {
      successToast(t("shareReady"));
      return;
    }

    if (moderationStatus === "rejected") {
      errorToast(
        t("shareRejected"),
        moderation.data?.moderationReason || t("shareRejectedGeneric"),
      );
      return;
    }

    if (moderationStatus === "failed") {
      errorToast(t("shareFailed"), t("shareFailedDescription"));
    }
  }, [moderationStatus, moderation.data?.moderationReason, t]);

  const isPublishing = createAudio.isPending;

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
          options={topicOptions}
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
                {audioFile?.name ?? t("shareFormUploadHint")}
              </span>
            </button>
            <Input
              ref={audioInputRef}
              id="chatting-audio"
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(event) =>
                setAudioFile(event.target.files?.[0] ?? null)
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
                {coverFile?.name ?? t("shareFormCoverHint")}
              </span>
            </button>
            <Input
              ref={coverInputRef}
              id="chatting-cover"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) =>
                setCoverFile(event.target.files?.[0] ?? null)
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
            disabled={isPublishing}
          >
            {t("shareFormCancel")}
          </Button>
          <Button type="submit" disabled={isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                {t("shareUploading")}
              </>
            ) : (
              t("shareFormPublish")
            )}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
