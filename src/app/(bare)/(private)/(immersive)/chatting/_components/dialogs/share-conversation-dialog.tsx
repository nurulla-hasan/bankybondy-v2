"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useForm } from "@tanstack/react-form";
import { ImageIcon, Loader2, Mic, Square, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { FormInput } from "@/components/common/form-input";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/error";
import { errorToast, infoToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  useCreateAudio,
  useDeleteAudioUploads,
  useUploadAudioFiles,
} from "@/services/hooks/audio.hook";
import type { RawAudioTopicWithCount, UploadedAudioFiles } from "@/types";

import {
  isAcceptedAudioFile,
  isAcceptedImageFile,
  readAudioDuration,
} from "../shared/audio-file";
import { formatClock } from "../shared/format";
import { trackPendingAudio } from "../shared/moderation-tracker";

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
  const [staged, setStaged] = useState<UploadedAudioFiles>({
    audio_url: null,
    cover_image: null,
  });
  const [uploading, setUploading] = useState<{
    audio: number | null;
    cover: number | null;
  }>({ audio: null, cover: null });
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const progressTimers = useRef<Record<"audio" | "cover", ReturnType<
    typeof setInterval
  > | null>>({ audio: null, cover: null });
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const recordingSecondsRef = useRef(0);
  const micRequestRef = useRef(false);

  const createAudio = useCreateAudio();
  const uploadAudioFiles = useUploadAudioFiles();
  const deleteUploads = useDeleteAudioUploads();

  const isUploading = uploading.audio !== null || uploading.cover !== null;

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

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

  // Staged files are deleted only when the dialog gives up on them; a
  // published audio claims them, so closing after a successful create must
  // keep them.
  const discardStaged = (urls: (string | null)[]) => {
    const files = urls.filter((url): url is string => Boolean(url));
    if (files.length) deleteUploads.mutate(files);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
  };

  const releaseMicrophone = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  };

  const startRecording = async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      errorToast(t("shareMicUnsupported"));
      return;
    }

    micRequestRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRequestRef.current = false;
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const seconds = recordingSecondsRef.current;
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        releaseMicrophone();

        if (!blob.size) {
          errorToast(t("shareMicEmpty"));
          return;
        }

        const extension = type.includes("ogg")
          ? "ogg"
          : type.includes("mp4")
            ? "m4a"
            : "webm";
        const file = new File([blob], `recording-${Date.now()}.${extension}`, {
          type,
        });

        if (!isAcceptedAudioFile(file)) {
          errorToast(t("shareInvalidAudio"));
          return;
        }

        // MediaRecorder output often reports `Infinity` duration until it is
        // remuxed, so the wall-clock count is the reliable source here.
        setRecordedDuration(Math.max(1, seconds));
        void stageFile("audio", file);
      };

      recorder.start();
      recordingSecondsRef.current = 0;
      setRecordingSeconds(0);
      setRecording(true);
      recordingTimerRef.current = setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingSeconds(recordingSecondsRef.current);
      }, 1000);
    } catch (error) {
      micRequestRef.current = false;
      releaseMicrophone();
      errorToast(
        t("shareMicError"),
        getErrorMessage(error, t("shareMicErrorDescription")),
      );
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    setRecording(false);
    stopRecordingTimer();

    if (recorder && recorder.state !== "inactive") recorder.stop();
    else releaseMicrophone();
  };

  const reset = ({ keepStaged = false }: { keepStaged?: boolean } = {}) => {
    if (!keepStaged) discardStaged([staged.audio_url, staged.cover_image]);
    form.reset();
    setAudioFile(null);
    setCoverFile(null);
    setStaged({ audio_url: null, cover_image: null });
    setRecordedDuration(null);
    setRecordingSeconds(0);
    recordingSecondsRef.current = 0;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    // Closing mid-upload would orphan the file still landing in S3; closing
    // mid-recording would leave the microphone open.
    if (!nextOpen && (isUploading || recording || micRequestRef.current)) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const stageFile = async (kind: "audio" | "cover", file: File) => {
    const field = kind === "audio" ? "audio_url" : "cover_image";

    if (staged[field]) discardStaged([staged[field]]);

    // The browser can only measure its own hop to the API, which finishes
    // instantly while the server is still relaying the file to S3. A real
    // percentage would therefore jump straight to 100 and freeze there, so the
    // bar eases up to a ceiling and snaps to done when the response arrives.
    const stopProgress = () => {
      const timer = progressTimers.current[kind];
      if (timer) clearInterval(timer);
      progressTimers.current[kind] = null;
    };

    stopProgress();
    if (kind === "audio") setAudioFile(file);
    else setCoverFile(file);
    setStaged((current) => ({ ...current, [field]: null }));
    setUploading((current) => ({ ...current, [kind]: 3 }));
    progressTimers.current[kind] = setInterval(() => {
      setUploading((current) => {
        const percent = current[kind];
        if (percent === null) return current;
        const next = Math.min(
          92,
          percent + Math.max(1, Math.round((92 - percent) * 0.12)),
        );
        return { ...current, [kind]: next };
      });
    }, 200);

    try {
      const response = await uploadAudioFiles.mutateAsync(
        kind === "audio" ? { audio: file } : { cover: file },
      );
      const url =
        kind === "audio"
          ? response.data.audio_url
          : response.data.cover_image;

      if (!url) throw new Error("Missing uploaded URL");

      setStaged((current) => ({ ...current, [field]: url }));
    } catch (error) {
      if (kind === "audio") setAudioFile(null);
      else setCoverFile(null);
      errorToast(
        t("shareUploadFailed"),
        getErrorMessage(error, t("shareUploadFailedDescription")),
      );
    } finally {
      stopProgress();
      setUploading((current) => ({ ...current, [kind]: null }));
    }
  };

  const handleAudioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isAcceptedAudioFile(file)) {
      errorToast(t("shareInvalidAudio"));
      return;
    }

    setRecordedDuration(null);
    void stageFile("audio", file);
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isAcceptedImageFile(file)) {
      errorToast(t("shareInvalidCover"));
      return;
    }

    void stageFile("cover", file);
  };

  const removeFile = (kind: "audio" | "cover") => {
    const field = kind === "audio" ? "audio_url" : "cover_image";
    discardStaged([staged[field]]);

    if (kind === "audio") {
      setAudioFile(null);
      setRecordedDuration(null);
    } else {
      setCoverFile(null);
    }
    setStaged((current) => ({ ...current, [field]: null }));
  };

  const publish = async (value: ShareConversationValues) => {
    if (!audioFile || !coverFile) {
      errorToast(
        !audioFile ? t("shareAudioRequired") : t("shareCoverRequired"),
      );
      return;
    }

    if (!staged.audio_url || !staged.cover_image) {
      errorToast(
        t("shareUploadFailed"),
        t("shareUploadFailedDescription"),
      );
      return;
    }

    let duration: number;
    if (recordedDuration) {
      duration = recordedDuration;
    } else {
      try {
        duration = await readAudioDuration(audioFile);
      } catch {
        errorToast(t("shareDurationError"));
        return;
      }
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
          audio_url: staged.audio_url,
          cover_image: staged.cover_image,
        },
      },
      {
        onSuccess: (response) => {
          // The audio now owns the files: clear without deleting.
          reset({ keepStaged: true });
          setOpen(false);
          infoToast(t("shareProcessing"));

          // The watcher (not this dialog) reports the moderation outcome, so it
          // survives closing the dialog or leaving the page.
          if (response.data?._id) trackPendingAudio(response.data._id);
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

  const isPublishing = createAudio.isPending;
  const isBusy = isPublishing || isUploading || recording;

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
            <div className="relative flex flex-1 flex-col">
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={isBusy}
                className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="size-5 text-muted-foreground" aria-hidden />
                <span className="max-w-full truncate text-sm font-medium">
                  {uploading.audio !== null
                    ? t("shareUploadProgress", { percent: uploading.audio })
                    : (audioFile?.name ?? t("shareFormUploadHint"))}
                </span>
                {uploading.audio !== null ? (
                  <span
                    className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={uploading.audio}
                  >
                    <span
                      className={cn(
                        "block h-full rounded-full bg-primary transition-all",
                        // At the top of the eased range the server is still
                        // relaying to S3; pulse so a stalled number reads as
                        // "waiting", not "finished".
                        uploading.audio >= 90 && "animate-pulse",
                      )}
                      style={{ width: `${uploading.audio}%` }}
                    />
                  </span>
                ) : null}
              </button>

              {audioFile && !isBusy ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  aria-label={t("shareFormRemoveFile")}
                  onClick={() => removeFile("audio")}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-xs",
                  recording
                    ? "font-medium text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {recording
                  ? t("shareMicRecording", {
                      time: formatClock(recordingSeconds),
                    })
                  : t("shareMicHint")}
              </span>
              <Button
                type="button"
                variant={recording ? "destructive" : "outline"}
                disabled={isBusy && !recording}
                onClick={
                  recording
                    ? stopRecording
                    : () => void startRecording()
                }
              >
                {recording ? (
                  <>
                    <Square aria-hidden className="fill-current" />
                    {t("shareMicStop")}
                  </>
                ) : (
                  <>
                    <Mic aria-hidden />
                    {t("shareMicStart")}
                  </>
                )}
              </Button>
            </div>

            <Input
              ref={audioInputRef}
              id="chatting-audio"
              type="file"
              accept="audio/*"
              className="sr-only"
              disabled={isBusy}
              onChange={handleAudioChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="chatting-cover">{t("shareFormCover")}</Label>
            <div className="relative flex flex-1 flex-col">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isBusy}
                className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
                <span className="max-w-full truncate text-sm font-medium">
                  {uploading.cover !== null
                    ? t("shareUploadProgress", { percent: uploading.cover })
                    : (coverFile?.name ?? t("shareFormCoverHint"))}
                </span>
                {uploading.cover !== null ? (
                  <span
                    className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={uploading.cover}
                  >
                    <span
                      className={cn(
                        "block h-full rounded-full bg-primary transition-all",
                        uploading.cover >= 90 && "animate-pulse",
                      )}
                      style={{ width: `${uploading.cover}%` }}
                    />
                  </span>
                ) : null}
              </button>

              {coverFile && !isBusy ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  aria-label={t("shareFormRemoveFile")}
                  onClick={() => removeFile("cover")}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>
            <Input
              ref={coverInputRef}
              id="chatting-cover"
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isBusy}
              onChange={handleCoverChange}
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
            disabled={isBusy}
          >
            {t("shareFormCancel")}
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isPublishing ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                {t("sharePublishing")}
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
