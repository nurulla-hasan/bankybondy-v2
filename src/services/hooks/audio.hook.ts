"use client";

import { useEffect } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { getErrorMessage } from "@/lib/error";
import { errorToast } from "@/lib/toast";
import type {
  AudioFeedbackInput,
  AudioListQueryParams,
  CreateAudioInput,
  UpdateAudioFiles,
  UpdateAudioInput,
} from "@/types";

import {
  createAudio,
  deleteAudio,
  deleteAudioUploads,
  getAllAudios,
  getAudioDetail,
  getAudioFeedback,
  getAudioModerationStatus,
  getFeelingTags,
  getMyAudioBookmarks,
  getMyAudios,
  giveAudioRating,
  recordAudioListen,
  saveAudioFeedback,
  toggleAudioBookmark,
  updateAudio,
  uploadAudioFiles,
} from "../api/audio.api";
import { getAudioTopics } from "../api/topic.api";

/** One feed page fills the grid (plus the featured slot on page one). */
export const FEED_PAGE_SIZE = 12;

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
  detail: (audioId: string) => [...audioKeys.all, "detail", audioId] as const,
  feedbackBase: (audioId: string) =>
    [...audioKeys.all, "feedback", audioId] as const,
  feedback: (audioId: string, limit: number) =>
    [...audioKeys.feedbackBase(audioId), limit] as const,
  feelingTags: () => [...audioKeys.all, "feeling-tags"] as const,
  myAudios: (params: AudioListQueryParams) =>
    [...audioKeys.all, "my-audios", params] as const,
  topics: () => [...audioKeys.all, "topics"] as const,
  bookmarks: () => [...audioKeys.all, "bookmarks"] as const,
  saved: () => [...audioKeys.all, "saved"] as const,
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

export function useInfiniteAudioFeed(
  params: Omit<AudioListQueryParams, "page">,
) {
  return useInfiniteQuery({
    queryKey: [...audioKeys.lists(), "infinite", params],
    queryFn: ({ pageParam }) => getAllAudios({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage.data;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
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
      void queryClient.invalidateQueries({ queryKey: audioKeys.saved() });
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
  signal?: AbortSignal;
}

/**
 * Stages a file as soon as it is picked. The returned URLs are what the create
 * call publishes, so the dialog can retry without uploading again.
 */
export function useUploadAudioFiles() {
  return useMutation({
    mutationFn: ({ audio, cover, signal }: UploadAudioFilesVariables) =>
      uploadAudioFiles({ audio, cover, signal }),
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
 * One conversation with aggregates. The owner sees the moderation reason and
 * a non-`ready` row, so this also polls while the server re-moderates an edit
 * (same cadence as the upload watcher).
 */
export function useAudioDetail(audioId: string) {
  return useQuery({
    queryKey: audioKeys.detail(audioId),
    queryFn: () => getAudioDetail(audioId),
    select: (response) => response.data,
    staleTime: 30 * 1000,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.data.moderationStatus;
      if (status === "processing") return MODERATION_POLL_MS;
      if (status === "failed") return MODERATION_RETRY_POLL_MS;
      return false;
    },
  });
}

/**
 * Comments of one conversation. "Load more" raises `limit` with `page` fixed
 * at 1, which is the pattern the server caps at 500 rows.
 */
export function useAudioFeedback(
  audioId: string,
  limit: number,
  enabled = true,
) {
  return useQuery({
    queryKey: audioKeys.feedback(audioId, limit),
    queryFn: () => getAudioFeedback(audioId, { page: 1, limit }),
    select: (response) => response.data,
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

/** The controlled feeling vocabulary; it does not change per session. */
export function useFeelingTags() {
  return useQuery({
    queryKey: audioKeys.feelingTags(),
    queryFn: () => getFeelingTags(),
    select: (response) => response.data,
    staleTime: Infinity,
  });
}

/** The caller's own conversations, any moderation status. */
export function useMyAudios(params: AudioListQueryParams) {
  return useQuery({
    queryKey: audioKeys.myAudios(params),
    queryFn: () => getMyAudios(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

/** Full bookmark rows (the ids cache above only stores ids). */
export function useBookmarkedAudios(enabled = true) {
  return useQuery({
    queryKey: audioKeys.saved(),
    queryFn: () => getMyAudioBookmarks(),
    select: (response) => response.data,
    enabled,
    staleTime: 60 * 1000,
  });
}

/** One rating per listener; the reply carries the updated counters. */
export function useGiveAudioRating(audioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rating: number) => giveAudioRating(audioId, rating),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: audioKeys.detail(audioId),
      });
      void queryClient.invalidateQueries({ queryKey: audioKeys.lists() });
    },
  });
}

export interface SaveAudioFeedbackVariables {
  input: AudioFeedbackInput;
}

/** Upserts the caller's comment/feelings and refreshes the aggregate view. */
export function useSaveAudioFeedback(audioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input }: SaveAudioFeedbackVariables) =>
      saveAudioFeedback(audioId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: audioKeys.detail(audioId),
      });
      void queryClient.invalidateQueries({
        queryKey: audioKeys.feedbackBase(audioId),
      });
    },
  });
}

export interface UpdateAudioVariables {
  input: UpdateAudioInput;
  files?: UpdateAudioFiles;
}

/**
 * Text edits are visible immediately; replacing the audio puts the row back
 * into `processing` server-side, so the detail hook keeps polling.
 */
export function useUpdateAudio(audioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, files }: UpdateAudioVariables) =>
      updateAudio(audioId, input, files),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: audioKeys.detail(audioId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...audioKeys.all, "my-audios"],
      });
      void queryClient.invalidateQueries({ queryKey: audioKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: audioKeys.saved() });
    },
  });
}

/** Removes the conversation everywhere it can be cached. */
export function useDeleteAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (audioId: string) => deleteAudio(audioId),
    onSuccess: (_response, audioId) => {
      queryClient.removeQueries({ queryKey: audioKeys.detail(audioId) });
      void queryClient.invalidateQueries({ queryKey: audioKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: [...audioKeys.all, "my-audios"],
      });
      void queryClient.invalidateQueries({ queryKey: audioKeys.saved() });
      void queryClient.invalidateQueries({ queryKey: audioKeys.bookmarks() });
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
    if (status !== "ready" && status !== "rejected") return;
    void queryClient.invalidateQueries({ queryKey: audioKeys.lists() });
    void queryClient.invalidateQueries({
      queryKey: [...audioKeys.all, "my-audios"],
    });
    if (audioId) {
      void queryClient.invalidateQueries({
        queryKey: audioKeys.detail(audioId),
      });
    }
  }, [status, audioId, queryClient]);

  return query;
}
