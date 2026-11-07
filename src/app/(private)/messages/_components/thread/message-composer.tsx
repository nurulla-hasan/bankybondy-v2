"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileText, Film, Paperclip, Send, Smile, X } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error";
import { errorToast } from "@/lib/toast";
import {
  deleteConversationFiles,
  uploadConversationFile,
} from "@/services/api/chat.api";
import type { ConversationFileKind, NewMessagePayload } from "@/types";

/**
 * Code points instead of literals, and only single-codepoint emoji: every entry
 * renders as emoji without a variation selector, so the grid stays honest data.
 */
const EMOJIS = [
  0x1f600, 0x1f603, 0x1f604, 0x1f601, 0x1f606, 0x1f605, 0x1f602, 0x1f923,
  0x1f60a, 0x1f607, 0x1f642, 0x1f643, 0x1f609, 0x1f60c, 0x1f60d, 0x1f970,
  0x1f618, 0x1f617, 0x1f619, 0x1f61a, 0x1f60b, 0x1f61b, 0x1f61c, 0x1f61d,
  0x1f92a, 0x1f60f, 0x1f612, 0x1f614, 0x1f62e, 0x1f62f, 0x1f632, 0x1f633,
  0x1f626, 0x1f627, 0x1f628, 0x1f630, 0x1f625, 0x1f622, 0x1f61e, 0x1f613,
  0x1f61f, 0x1f611, 0x1f636, 0x1f644, 0x1f928, 0x1f9d0, 0x1f60e, 0x1f973,
  0x1f608, 0x1f47f, 0x1f480, 0x1f631, 0x1f615, 0x1f4ab, 0x1f929, 0x1f92b,
  0x1f44d, 0x1f44e, 0x1f44a, 0x270a, 0x270b, 0x1f91b, 0x1f91c, 0x1f91e,
  0x1f91f, 0x1f44c, 0x1f90f, 0x1f44f, 0x1f64c, 0x1f91d, 0x1f4aa, 0x1f64f,
  0x1f485, 0x1f933, 0x1f450, 0x1f64b, 0x1f646, 0x1f48f, 0x1f491, 0x1f9d9,
  0x1f48c, 0x1f9e1, 0x1f49b, 0x1f49a, 0x1f499, 0x1f49c, 0x1f90d, 0x1f9e2,
  0x1f494, 0x1f495, 0x1f496, 0x1f497, 0x1f498, 0x1f493, 0x1f49e, 0x1f49f,
  0x1f389, 0x1f388, 0x1f38a, 0x1f37b, 0x1f4af, 0x1f3c6, 0x1f31f, 0x2728,
  0x1f525, 0x1f4a7, 0x1f4a5, 0x1f30c, 0x1f308, 0x1f384, 0x1f381, 0x1f3b0,
  0x1f9f5, 0x1f9f6, 0x1f3a8, 0x1f3a1, 0x1f4e1, 0x1f9f3, 0x1fa71, 0x1f4a1,
  0x1f4dd, 0x1f4b0, 0x1f4b8, 0x1f4b5, 0x1f6d2, 0x1f4b3, 0x1f9fe, 0x1fad6,
  0x1f338, 0x1f339, 0x1f33a, 0x1f33b, 0x1f33c, 0x1f337, 0x1f331, 0x1f332,
  0x1f333, 0x1f334, 0x1f335, 0x1f340, 0x1f341, 0x1f343, 0x1f342, 0x1f344,
  0x1f436, 0x1f431, 0x1f981, 0x1f42a, 0x1f999, 0x1f422, 0x1f98a, 0x1f426,
  0x1f985, 0x1f423, 0x1f424, 0x1f425, 0x1f427, 0x1f984, 0x1f41d, 0x1f41c,
  0x1f34e, 0x1f34f, 0x1f350, 0x1f34a, 0x1f34b, 0x1f34c, 0x1f353, 0x1f352,
  0x1f345, 0x1f965, 0x1f35e, 0x1f9c0, 0x2615, 0x1f36a, 0x1f36b, 0x1f370,
  0x2705, 0x274c, 0x2757, 0x1f44b, 0x1f918, 0x1f919, 0x1f4df, 0x1f514,
].map((code) => String.fromCodePoint(code));

/** The backend's multer limit (`helper/mutler-s3-uploader.ts`). */
const MAX_FILE_BYTES = 50 * 1024 * 1024;

interface MessageComposerProps {
  isPending: boolean;
  /** Resolves once the server accepted/echoed it; rejects so the draft survives. */
  onSend: (payload: NewMessagePayload) => Promise<void>;
}

/**
 * A file is uploaded the moment it is picked. The send then carries CloudFront
 * URLs only — the API filters out anything that is not on our CDN, and a blob
 * URL would be dropped silently.
 */
interface PendingAttachment {
  id: string;
  name: string;
  kind: ConversationFileKind;
  url?: string;
  state: "uploading" | "done" | "error";
}

function kindOf(file: File): ConversationFileKind | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return null;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function MessageComposer({ isPending, onSend }: MessageComposerProps) {
  const t = useTranslations("Messages");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState("");
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const reduceMotion = useReducedMotion();

  /** Files removed while their upload was still in flight. */
  const removedRef = useRef<Set<string>>(new Set());

  const updateAttachment = (
    id: string,
    changes: Partial<PendingAttachment>,
  ) => {
    setPending((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const startUpload = (file: File) => {
    const kind = kindOf(file);
    if (!kind) {
      errorToast(t("unsupportedFile"), file.name);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      errorToast(t("fileTooLarge"), file.name);
      return;
    }

    const id = createId();
    setPending((current) => [
      ...current,
      { id, name: file.name, kind, state: "uploading" },
    ]);

    void (async () => {
      try {
        const response = await uploadConversationFile(file, kind);
        const url =
          kind === "image"
            ? response.data.images[0]
            : kind === "video"
              ? response.data.videos[0]
              : response.data.pdfs[0];

        if (!url) {
          throw new Error("The upload returned no file URL");
        }

        // Removed while uploading: the file is already on S3, so drop it there
        // too rather than leaving an orphan nobody will ever send.
        if (removedRef.current.has(id)) {
          void deleteConversationFiles([url]).catch(() => undefined);
          return;
        }

        updateAttachment(id, { url, state: "done" });
      } catch (error) {
        updateAttachment(id, { state: "error" });
        errorToast(
          t("uploadFailed"),
          getErrorMessage(error, t("uploadFailedDescription")),
        );
      }
    })();
  };

  const removeAttachment = (item: PendingAttachment) => {
    removedRef.current.add(item.id);
    setPending((current) => current.filter((entry) => entry.id !== item.id));

    if (item.url) {
      void deleteConversationFiles([item.url]).catch(() => undefined);
    }
  };

  const submit = async () => {
    if (isPending) return;

    const hasUploading = pending.some((item) => item.state === "uploading");
    if (hasUploading) return;

    const ready = pending.filter((item) => item.state === "done" && item.url);
    const trimmed = text.trim();
    if (!trimmed && !ready.length) return;

    const urlsOf = (kind: ConversationFileKind) =>
      ready
        .filter((item) => item.kind === kind)
        .map((item) => item.url as string);

    const payload: NewMessagePayload = {
      text: trimmed,
      imageUrl: urlsOf("image"),
      videoUrl: urlsOf("video"),
      pdfUrl: urlsOf("pdf"),
    };

    try {
      await onSend(payload);

      // The mutation resolves as soon as a transport accepts the send (both
      // transports reconcile in the background), so a rejection here means it
      // never started — keep the draft and attachments for a retry.
      setPending([]);
      removedRef.current.clear();
      setText("");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      // Draft and attachments stay as they were.
    }
  };

  const addEmoji = (emoji: string) => {
    setText((value) => value + emoji);
    textareaRef.current?.focus();
  };

  const hasUploading = pending.some((item) => item.state === "uploading");
  const hasReady = pending.some((item) => item.state === "done");
  const canSend = !isPending && !hasUploading && Boolean(text.trim() || hasReady);

  // `height` is not a transform, so MotionConfig leaves it alone — opt out by hand.
  const panelMotion = reduceMotion
    ? {}
    : {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
        exit: { height: 0, opacity: 0 },
      };

  return (
    <form
      className="flex shrink-0 flex-col gap-2 border-t border-border px-3 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {pending.length ? (
        <AttachmentGroup aria-label={t("attachmentsPending")}>
          <AnimatePresence>
            {pending.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex-none"
              >
                <Attachment size="xs" state={item.state}>
                  <AttachmentMedia
                    variant={
                      item.kind === "image" && item.url ? "image" : "icon"
                    }
                  >
                    {item.state === "uploading" ? (
                      <Spinner />
                    ) : item.kind === "image" && item.url ? (
                      <Image
                        src={item.url}
                        alt=""
                        width={96}
                        height={96}
                        unoptimized
                      />
                    ) : item.kind === "video" ? (
                      <Film />
                    ) : (
                      <FileText />
                    )}
                  </AttachmentMedia>

                  <AttachmentContent>
                    <AttachmentTitle>{item.name}</AttachmentTitle>
                    {item.state === "uploading" ? (
                      <AttachmentDescription>
                        {t("uploading")}
                      </AttachmentDescription>
                    ) : item.state === "error" ? (
                      <AttachmentDescription>
                        {t("uploadFailed")}
                      </AttachmentDescription>
                    ) : null}
                  </AttachmentContent>

                  <AttachmentActions>
                    <AttachmentAction
                      variant="secondary"
                      aria-label={t("removeAttachment")}
                      onClick={() => removeAttachment(item)}
                    >
                      <X />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              </motion.div>
            ))}
          </AnimatePresence>
        </AttachmentGroup>
      ) : null}

      <AnimatePresence>
        {showEmoji ? (
          <motion.div
            key="emoji-panel"
            {...panelMotion}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="max-h-44 overflow-y-auto rounded-xl border border-border bg-muted/30 p-2">
              <div
                role="group"
                aria-label={t("emojiPicker")}
                className="flex flex-wrap gap-1"
              >
                {EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-base"
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,video/*"
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            // Reset so picking the same file again still fires `change`.
            event.target.value = "";
            files.forEach(startUpload);
          }}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label={t("attach")}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip />
        </Button>

        <label className="sr-only" htmlFor="message-composer">
          {t("composerPlaceholder")}
        </label>

        <Textarea
          id="message-composer"
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder={t("composerPlaceholder")}
          rows={1}
          className="max-h-32 min-h-9 resize-none field-sizing-content"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label={t("emoji")}
          aria-expanded={showEmoji}
          onClick={() => setShowEmoji((value) => !value)}
        >
          <Smile />
        </Button>

        <Button type="submit" size="icon-lg" disabled={!canSend} aria-label={t("send")}>
          {isPending ? <Spinner /> : <Send />}
        </Button>
      </div>
    </form>
  );
}
