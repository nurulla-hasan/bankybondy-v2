"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

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
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import { getInitials } from "@/lib/utils";
import type { RawChatMessage } from "@/types";

import { formatChatClock, useHydrated } from "../shared/chat-timestamp";

interface MessageBubbleProps {
  message: RawChatMessage;
  /** Group threads name the sender, a 1-a-1 chat does not need it. */
  showAuthor: boolean;
}

export function MessageBubble({ message, showAuthor }: MessageBubbleProps) {
  const t = useTranslations("Messages");
  const locale = useLocale();
  const hydrated = useHydrated();

  const mine = message.isMyMessage;
  const images = message.imageUrl ?? [];
  const pdfs = message.pdfUrl ?? [];
  const author = !mine && showAuthor;

  return (
    <Message align={mine ? "end" : "start"}>
      {author ? (
        <MessageAvatar>
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
        {author ? <MessageHeader>{message.userDetails.name}</MessageHeader> : null}

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
              <Bubble variant="ghost" className={images.length > 1 ? "max-w-sm" : "max-w-60"}>
                <ul className={images.length > 1 ? "grid grid-cols-2 gap-1" : "grid"}>
                  {images.map((src, index) => (
                    <li key={`${message._id}-image-${index}`}>
                      <Image
                        src={src}
                        alt={t("attachmentImage", { count: images.length })}
                        width={320}
                        height={320}
                        unoptimized={isMockAttachment(src)}
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </Bubble>
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
              <Bubble variant={mine ? "default" : "secondary"}>
                <BubbleContent>
                  <p className="leading-relaxed">{message.text}</p>
                </BubbleContent>
              </Bubble>
            ) : null}
          </>
        )}

        <MessageFooter>
          {hydrated && message.createdAt ? formatChatClock(message.createdAt, locale) : "\u00A0"}
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}

/** MOCK-ONLY: seed attachments are `data:`/`mock:` URIs, which next/image cannot resolve. */
function isMockAttachment(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("mock:");
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
