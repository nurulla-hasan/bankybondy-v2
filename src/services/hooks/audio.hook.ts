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
  getAllAudios,
  getAudioModerationStatus,
  getMyAudioBookmarks,
  recordAudioListen,
  toggleAudioBookmark,
} from "../api/audio.api";
import { getAudioTopics } from "../api/topic.api";

/** One feed page is enough to fill the grid without a second request. */
export const FEED_PAGE_SIZE = 60;

/** The topic catalog is read whole so the filter chips need no pagination. */
const TOPIC_LIST_LIMIT = 500;

/** Moderation is background work (ffmpeg + AI); poll slowly until terminal. */
const MODERATION_POLL_MS = 4 * 1000;

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

export interface CreateAudioVariables {
  input: CreateAudioInput;
  audio: File;
  cover: File;
}

/**
 * Upload one conversation. The reply is 202 + `processing`, so invalidation
 * here is just a courtesy; the moderation polling hook invalidates again once
 * the background worker approves the audio.
 */
export function useCreateAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, audio, cover }: CreateAudioVariables) =>
      createAudio(input, audio, cover),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: audioKeys.lists() });
    },
  });
}

/**
 * Polls one upload until `ready` / `rejected` / `failed`. The interval is
 * disabled for terminal statuses, so a finished conversation stops the loop
 * without extra state.
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
      const isTerminal =
        status === "ready" || status === "rejected" || status === "failed";
      return isTerminal ? false : MODERATION_POLL_MS;
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
