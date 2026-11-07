"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { getErrorMessage } from "@/lib/error";
import { errorToast } from "@/lib/toast";
import type {
  AudioListQueryParams,
  CreateAudioInput,
} from "@/types";

import {
  createAudio,
  deleteAudioUploads,
  getAllAudios,
  getAudioModerationStatus,
  getMyAudioBookmarks,
  recordAudioListen,
  toggleAudioBookmark,
  uploadAudioFiles,
} from "../api/audio.api";
import { getAudioTopics } from "../api/topic.api";

/** One feed page is enough to fill the grid without a second request. */
export const FEED_PAGE_SIZE = 60;

/** The topic catalog is read whole so the filter chips need no pagination. */
const TOPIC_LIST_LIMIT = 500;

/** Moderation is background work (ffmpeg + AI); poll slowly until terminal. */
const MODERATION_POLL_MS = 4 * 1000;

/**
 * A technical `failed` is not final: the worker sweep re-runs it (up to
 * `AUDIO_FAILED_MAX_RETRIES`, 30 min backoff). Keep a slow poll so a later
 * `ready`/`rejected` still reaches the dialog instead of dying as a hard error.
 */
const MODERATION_RETRY_POLL_MS = 60 * 1000;

export const audioKeys = {
  all: ["audio"] as const,
  lists: () => [...audioKeys.all, "list"] as const,
  list: (params: AudioListQueryParams) =>
    [...audioKeys.lists(), params] as const,
  topics: () => [...audioKeys.all, "topics"] as const,
  bookmarks: () => [...audioKeys.all, "bookmarks"] as const,
  moderation: (audioId: string | null) =>
    [...audioKeys.all, "moderation", audioId] as const,
};

/**
 * The feed. Section and topic filtering happen server-side (`sort` and
 * `audioTopic`), so switching sections never sorts stale client rows.
 */
export function useAudioFeed(params: AudioListQueryParams) {
  return useQuery({
    queryKey: audioKeys.list(params),
    queryFn: () => getAllAudios(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

/** Topic chips and the topic ranking rail, including `totalAudios`. */
export function useAudioTopics() {
  return useQuery({
    queryKey: audioKeys.topics(),
    queryFn: () => getAudioTopics({ limit: TOPIC_LIST_LIMIT }),
    select: (response) => response.data.result,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * The ids this user saved. The raw cache holds a `string[]` on purpose: the
 * optimistic toggle can add/remove an id without inventing a full audio row.
 */
export function useBookmarkedAudioIds(enabled = true) {
  return useQuery({
    queryKey: audioKeys.bookmarks(),
    queryFn: async () => {
      const response = await getMyAudioBookmarks();
      return response.data.map((bookmark) => bookmark.audio._id);
    },
    select: (ids) => new Set(ids),
    enabled,
    staleTime: 60 * 1000,
  });
}

/**
 * Bookmark add/delete is one endpoint. The cache flips immediately; a refused
 * call restores the previous ids and refetches server truth on settle.
 */
export function useToggleAudioBookmark() {
  const queryClient = useQueryClient();
  const t = useTranslations("Chatting");

  return useMutation({
    mutationFn: (audioId: string) => toggleAudioBookmark(audioId),
    onMutate: async (audioId) => {
      await queryClient.cancelQueries({ queryKey: audioKeys.bookmarks() });

      const previous = queryClient.getQueryData<string[]>(
        audioKeys.bookmarks(),
      );

      queryClient.setQueryData<string[]>(audioKeys.bookmarks(), (ids = []) =>
        ids.includes(audioId)
          ? ids.filter((id) => id !== audioId)
          : [audioId, ...ids],
      );

      return { previous };
    },
    onError: (error, _audioId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(audioKeys.bookmarks(), context.previous);
      }
      errorToast(
        t("saveFailed"),
        getErrorMessage(error, t("saveFailedDescription")),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: audioKeys.bookmarks() });
    },
  });
}

export interface RecordListenVariables {
  audioId: string;
  secondsListened: number;
  completion: number;
}

/**
 * Background analytics ping from the player. A failure here must never
 * interrupt playback, so it is logged instead of surfaced as a toast.
 */
export function useRecordAudioListen() {
  return useMutation({
    mutationFn: ({ audioId, secondsListened, completion }: RecordListenVariables) =>
      recordAudioListen(audioId, { secondsListened, completion }),
    onError: (error) => {
      console.error(
        "Failed to record audio listen",
        getErrorMessage(error, "Unknown error"),
      );
    },
  });
}

export interface UploadAudioFilesVariables {
  audio?: File;
  cover?: File;
}

/**
 * Stages a file as soon as it is picked. The returned URLs are what the create
 * call publishes, so the dialog can retry without uploading again.
 */
export function useUploadAudioFiles() {
  return useMutation({
    mutationFn: ({ audio, cover }: UploadAudioFilesVariables) =>
      uploadAudioFiles({ audio, cover }),
  });
}

/**
 * Removes staged files the dialog never published. Best effort: a failure is
 * logged rather than shown, and the server refuses anything not owned.
 */
export function useDeleteAudioUploads() {
  return useMutation({
    mutationFn: (files: string[]) => deleteAudioUploads(files),
    onError: (error) => {
      console.error(
        "Failed to delete staged audio uploads",
        getErrorMessage(error, "Unknown error"),
      );
    },
  });
}

export interface CreateAudioVariables {
  input: CreateAudioInput;
}

/**
 * Publishes a conversation from already-uploaded files. The reply is
 * 202 + `processing`, so invalidation here is just a courtesy; the moderation
 * polling hook invalidates again once the background worker approves it.
 */
export function useCreateAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input }: CreateAudioVariables) => createAudio(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: audioKeys.lists() });
    },
  });
}

/**
 * Polls one upload until `ready` / `rejected`. `failed` is a technical state
 * the sweep retries, so it only slows the loop down instead of stopping it.
 */
export function useAudioModerationStatus(audioId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: audioKeys.moderation(audioId),
    queryFn: () => getAudioModerationStatus(audioId as string),
    select: (response) => response.data,
    enabled: Boolean(audioId),
    refetchInterval: (query) => {
      const status = query.state.data?.data.moderationStatus;
      if (status === "ready" || status === "rejected") return false;
      return status === "failed"
        ? MODERATION_RETRY_POLL_MS
        : MODERATION_POLL_MS;
    },
  });

  const status = query.data?.moderationStatus;

  useEffect(() => {
    if (status === "ready") {
      void queryClient.invalidateQueries({ queryKey: audioKeys.lists() });
    }
  }, [status, queryClient]);

  return query;
}
