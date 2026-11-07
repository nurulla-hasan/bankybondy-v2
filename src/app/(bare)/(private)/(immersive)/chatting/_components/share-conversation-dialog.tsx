"use client";

import { useRef, useState } from "react";
import { ImageIcon, Mic, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { successToast } from "@/lib/toast";

import { MOCK_TOPIC_ENTRIES } from "./mock-data";

export function ShareConversationDialog() {
  const t = useTranslations("Chatting");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTitle("");
      setTopic("");
      setDescription("");
      setTags("");
      setAudioFileName(null);
      setCoverFileName(null);
    }
  };

  const handlePublish = () => {
    handleOpenChange(false);
    successToast(t("shareMockTitle"), t("shareMockDescription"));
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={t("shareTitle")}
      description={t("shareDescription")}
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
          handlePublish();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="chatting-title">{t("shareFormTitle")}</Label>
          <Input
            id="chatting-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("shareFormTitlePlaceholder")}
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatting-topic">{t("shareFormTopic")}</Label>
          <Select value={topic} onValueChange={(value) => setTopic(value as string)}>
            <SelectTrigger id="chatting-topic" className="w-full">
              <SelectValue placeholder={t("shareFormTopicPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {MOCK_TOPIC_ENTRIES.map((entry) => (
                <SelectItem key={entry.key} value={entry.key}>
                  {entry.topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatting-description">
            {t("shareFormDescription")}
          </Label>
          <Textarea
            id="chatting-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("shareFormDescriptionPlaceholder")}
            maxLength={400}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatting-tags">{t("shareFormTags")}</Label>
          <Input
            id="chatting-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder={t("shareFormTagsPlaceholder")}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="chatting-audio">{t("shareFormUpload")}</Label>
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="flex h-full w-full cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted"
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

          <div className="space-y-2">
            <Label htmlFor="chatting-cover">{t("shareFormCover")}</Label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="flex h-full w-full cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted"
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
