"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Clock3, FileText, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import { cn, getInitials } from "@/lib/utils";
import type { RawChatMessage } from "@/types";

import { formatChatClock, useHydrated } from "../shared/chat-timestamp";
import { ImageLightbox } from "./image-lightbox";

interface MessageBubbleProps {
  message: RawChatMessage;
  /** Group threads name the sender, a 1-a-1 chat does not need it. */
  showAuthor: boolean;
  /** Identity belongs to the top of a run, timestamps to its bottom. */
  firstOfRun: boolean;
  lastOfRun: boolean;
  /** Soft-deletes our own message; omit for a read-only thread. */
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  showAuthor,
  firstOfRun,
  lastOfRun,
  onDelete,
}: MessageBubbleProps) {
  const t = useTranslations("Messages");
  const locale = useLocale();
  const hydrated = useHydrated();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const mine = message.isMyMessage;
  const images = message.imageUrl ?? [];
  const videos = message.videoUrl ?? [];
  const pdfs = message.pdfUrl ?? [];
  const author = !mine && showAuthor;
  const canDelete =
    Boolean(onDelete) && mine && !message.pending && !message.isDeleted;

  return (
    <motion.div
      className={cn(
        mine ? "origin-bottom-right" : "origin-bottom-left",
        message.pending && "opacity-60",
      )}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Message align={mine ? "end" : "start"}>
        {author ? (
          /* The gutter stays reserved on every row so a run lines up; only its
             top row shows who the messages came from. */
          <MessageAvatar className={firstOfRun ? undefined : "invisible"}>
            <Avatar>
              <AvatarImage
                src={message.userDetails.profile_image}
                alt={message.userDetails.name}
              />
              <AvatarFallback>{getInitials(message.userDetails.name)}</AvatarFallback>
            </Avatar>
          </MessageAvatar>
        ) : null}

        <MessageContent>
          {author && firstOfRun ? (
            <MessageHeader>{message.userDetails.name}</MessageHeader>
          ) : null}

          {/* One shrink-to-fit stack per message so the hover action can sit
              beside the bubble instead of inside a run's last footer. */}
          <div
            className={cn(
              "relative flex w-fit max-w-[80%] flex-col gap-2.5",
              mine ? "items-end self-end" : "items-start self-start",
            )}
          >
          {message.isDeleted ? (
            <Bubble variant="muted">
              <BubbleContent>
                <span className="text-muted-foreground italic">{t("deletedMessage")}</span>
              </BubbleContent>
            </Bubble>
          ) : (
            <>
              {/* Media and files are their own surfaces; only text gets a bubble. */}
              {images.length ? (
                <Bubble
                  variant="ghost"
                  className={images.length > 1 ? "w-64 max-w-sm" : "w-40 max-w-60"}
                >
                  <ul className={images.length > 1 ? "grid w-full grid-cols-2 gap-1" : "grid w-full"}>
                    {images.map((src, index) => (
                      <li key={`${message._id}-image-${index}`} className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(index)}
                          className="block w-full cursor-zoom-in overflow-hidden rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <Image
                            src={src}
                            alt={t("attachmentImage", { count: images.length })}
                            width={320}
                            height={320}
                            unoptimized
                            className="aspect-square w-full rounded-lg object-cover"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <ImageLightbox
                    images={images}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    label={t("attachmentImage", { count: images.length })}
                  />
                </Bubble>
              ) : null}

              {videos.length ? (
                <div className="flex flex-col gap-1">
                  {videos.map((src, index) => (
                    <video
                      key={`${message._id}-video-${index}`}
                      src={src}
                      controls
                      preload="metadata"
                      aria-label={t("attachmentVideo", { count: videos.length })}
                      className="max-w-60 rounded-lg"
                    />
                  ))}
                </div>
              ) : null}

              {pdfs.length ? (
                <AttachmentGroup className="max-w-sm">
                  {pdfs.map((src, index) => {
                    const name = fileName(src);

                    return (
                      <Attachment key={`${message._id}-pdf-${index}`} size="sm">
                        <AttachmentMedia variant="icon">
                          <FileText />
                        </AttachmentMedia>
                        <AttachmentContent>
                          {name ? <AttachmentTitle>{name}</AttachmentTitle> : null}
                          <AttachmentDescription>
                            {t("attachmentPdf", { count: 1 })}
                          </AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentTrigger
                          render={<a href={src} target="_blank" rel="noreferrer" />}
                        />
                      </Attachment>
                    );
                  })}
                </AttachmentGroup>
              ) : null}

              {message.text ? (
                <Bubble
                  variant={mine ? "default" : "secondary"}
                  className="max-w-full"
                >
                  <BubbleContent>
                    <p className="leading-relaxed">{message.text}</p>
                  </BubbleContent>
                </Bubble>
              ) : null}
            </>
          )}

          {canDelete ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("deleteMessage")}
              className="absolute end-full top-1/2 me-1 -translate-y-1/2 opacity-0 transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100"
              onClick={() => onDelete?.(message._id)}
            >
              <Trash2 aria-hidden />
            </Button>
          ) : null}
          </div>

          {lastOfRun ? (
            <MessageFooter>
              {message.pending ? (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3" aria-hidden />
                  {t("sending")}
                </span>
              ) : hydrated && message.createdAt ? (
                formatChatClock(message.createdAt, locale)
              ) : (
                "\u00A0"
              )}
            </MessageFooter>
          ) : null}
        </MessageContent>
      </Message>
    </motion.div>
  );
}

/**
 * The URL is the only name the wire carries, so the label comes from it — and a
 * URL with no file in it (a blob preview) simply shows the type.
 */
function fileName(src: string): string | null {
  const last = src.split("?")[0].split("/").pop() ?? "";
  if (!last.includes(".")) return null;

  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}
