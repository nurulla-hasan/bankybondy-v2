"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
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
import { useUpdateAudio } from "@/services/hooks/audio.hook";
import type {
  RawAudioTopicWithCount,
  RawMyAudio,
  UpdateAudioInput,
} from "@/types";

import {
  isAcceptedAudioFile,
  isAcceptedImageFile,
  readAudioDuration,
} from "../shared/audio-file";

interface EditConversationValues {
  title: string;
  topic: string;
  description: string;
  tags: string;
}

interface EditConversationDialogProps {
  audio: RawMyAudio;
  topics: readonly RawAudioTopicWithCount[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditConversationDialog({
  audio,
  topics,
  open,
  onOpenChange,
}: EditConversationDialogProps) {
  const t = useTranslations("Chatting");
  const updateAudio = useUpdateAudio(audio._id);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const topicOptions = useMemo(() => {
    const options = topics.map((topic) => ({
      value: topic._id,
      label: topic.name,
    }));
    if (
      audio.audioTopic &&
      !options.some((option) => option.value === audio.audioTopic?._id)
    ) {
      options.unshift({
        value: audio.audioTopic._id,
        label: audio.audioTopic.name,
      });
    }
    return options;
  }, [topics, audio.audioTopic]);

  const defaultValues = useMemo<EditConversationValues>(
    () => ({
      title: audio.title,
      topic: audio.audioTopic?._id ?? "",
      description: audio.description ?? "",
      tags: audio.tags.join(", "),
    }),
    [audio],
  );

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(3, { error: t("shareFormTitleError") }),
        topic: z.string().min(1, { error: t("shareFormTopicError") }),
        description: z
          .string()
          .trim()
          .min(10, { error: t("shareFormDescriptionError") }),
        tags: z.string(),
      }),
    [t],
  );

  const isBusy = updateAudio.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isBusy) return;
    onOpenChange(nextOpen);
  };

  const submit = async (value: EditConversationValues) => {
    const input: UpdateAudioInput = {
      title: value.title.trim(),
      description: value.description.trim(),
      audioTopic: value.topic,
      tags: value.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (audioFile) {
      try {
        input.duration = Math.round(await readAudioDuration(audioFile));
      } catch {
        errorToast(t("shareDurationError"));
        return;
      }
    }

    updateAudio.mutate(
      {
        input,
        files: {
          audio: audioFile ?? undefined,
          cover: coverFile ?? undefined,
        },
      },
      {
        onSuccess: () => {
          successToast(
            audioFile ? t("editProcessingHint") : t("editSaved"),
          );
          onOpenChange(false);
        },
        onError: (error) => {
          errorToast(
            t("editFailed"),
            getErrorMessage(error, t("editFailedDescription")),
          );
        },
      },
    );
  };

  const form = useForm({
    defaultValues,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      await submit(value);
    },
  });

  const handleAudioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isAcceptedAudioFile(file)) {
      errorToast(t("shareInvalidAudio"));
      return;
    }

    setAudioFile(file);
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isAcceptedImageFile(file)) {
      errorToast(t("shareInvalidCover"));
      return;
    }

    setCoverFile(file);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={t("editTitle")}
      description={t("editDescription")}
      size="lg"
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
            <Label htmlFor={`edit-audio-${audio._id}`}>
              {t("editReplaceAudio")}
            </Label>
            <div className="relative flex flex-1 flex-col">
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={isBusy}
                className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="size-5 text-muted-foreground" aria-hidden />
                <span className="max-w-full truncate text-sm font-medium">
                  {audioFile?.name ?? t("editReplaceAudioHint")}
                </span>
              </button>

              {audioFile ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  aria-label={t("shareFormRemoveFile")}
                  disabled={isBusy}
                  onClick={() => setAudioFile(null)}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>
            <Input
              ref={audioInputRef}
              id={`edit-audio-${audio._id}`}
              type="file"
              accept="audio/*"
              className="sr-only"
              disabled={isBusy}
              onChange={handleAudioChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`edit-cover-${audio._id}`}>
              {t("editReplaceCover")}
            </Label>
            <div className="relative flex flex-1 flex-col">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isBusy}
                className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImageIcon
                  className="size-5 text-muted-foreground"
                  aria-hidden
                />
                <span className="max-w-full truncate text-sm font-medium">
                  {coverFile?.name ?? t("editReplaceCoverHint")}
                </span>
              </button>

              {coverFile ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  aria-label={t("shareFormRemoveFile")}
                  disabled={isBusy}
                  onClick={() => setCoverFile(null)}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>
            <Input
              ref={coverInputRef}
              id={`edit-cover-${audio._id}`}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isBusy}
              onChange={handleCoverChange}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("editReplaceAudioHintDescription")}
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isBusy}
          >
            {t("shareFormCancel")}
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                {t("editSaving")}
              </>
            ) : (
              t("editSave")
            )}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
