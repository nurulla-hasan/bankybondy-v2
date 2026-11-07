import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AudioListQueryParams,
  AudioModerationResult,
  CreateAudioInput,
  RawAudio,
  RawAudioBookmark,
  RawAudioList,
  RecordAudioListenInput,
} from "@/types";

/**
 * The "We are chatting" feed. Only `moderationStatus: "ready"` audios reach it,
 * `user` is populated as `name profile_image`, and each row is enriched with
 * `averageRating`, `commentCount` and `topFeelings` (`audio.service.ts`
 * `getAllAudios`). Media URLs arrive signed.
 * Endpoint: GET /audio/all-audios
 */
export function getAllAudios(params?: AudioListQueryParams) {
  return apiClient<ApiResponse<RawAudioList>>("/audio/all-audios", {
    method: "GET",
    query: params,
  });
}

/**
 * Upload a conversation. Multer reads the two files by field name and
 * `parseMultipartData` turns the `data` part into the request body, so the
 * contract is exactly: `audio`, `audio_cover`, `data` (JSON string).
 * The server answers 202 with `moderationStatus: "processing"`; content
 * moderation + ffmpeg run in the background.
 * Endpoint: POST /audio/create-audio
 */
export function createAudio(
  input: CreateAudioInput,
  audio: File,
  cover: File,
) {
  const body = new FormData();
  body.append("audio", audio);
  body.append("audio_cover", cover);
  body.append("data", JSON.stringify(input));

  return apiClient<ApiResponse<RawAudio>>("/audio/create-audio", {
    method: "POST",
    body,
  });
}

/**
 * Poll the async moderation of one of our uploads until it leaves
 * `processing`. Only the owner can read it.
 * Endpoint: GET /audio/moderation-status/:audioId
 */
export function getAudioModerationStatus(audioId: string) {
  return apiClient<ApiResponse<AudioModerationResult>>(
    `/audio/moderation-status/${encodeURIComponent(audioId)}`,
    { method: "GET" },
  );
}

/**
 * Report a qualified listen (≥30s or ≥40%); the server dedupes per day.
 * Fire-and-forget from the player.
 * Endpoint: POST /audio/:audioId/listen
 */
export function recordAudioListen(
  audioId: string,
  input: RecordAudioListenInput,
) {
  return apiClient<ApiResponse<unknown>>(
    `/audio/${encodeURIComponent(audioId)}/listen`,
    { method: "POST", body: input },
  );
}

/**
 * Toggle a bookmark. The body is the same request for add and delete; the
 * response is the created bookmark or `null` when it was removed.
 * Endpoint: POST /audio-bookmark/add-delete/:id
 */
export function toggleAudioBookmark(audioId: string) {
  return apiClient<ApiResponse<RawAudioBookmark | null>>(
    `/audio-bookmark/add-delete/${encodeURIComponent(audioId)}`,
    { method: "POST" },
  );
}

/**
 * Every conversation this user bookmarked. The controller answers with 201.
 * Endpoint: GET /audio-bookmark/my-bookmark-audios
 */
export function getMyAudioBookmarks() {
  return apiClient<ApiResponse<RawAudioBookmark[]>>(
    "/audio-bookmark/my-bookmark-audios",
    { method: "GET" },
  );
}
