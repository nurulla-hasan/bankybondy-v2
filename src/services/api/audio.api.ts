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
  UploadedAudioFiles,
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
 * Stage one or both files before publishing. The server stores them under the
 * caller's own prefix and returns CloudFront URLs; the create call then sends
 * only JSON, so a cancelled dialog can delete what it never used.
 * Endpoint: POST /audio/upload-audio
 */
export function uploadAudioFiles({
  audio,
  cover,
}: {
  audio?: File;
  cover?: File;
}) {
  const body = new FormData();
  if (audio) body.append("audio", audio);
  if (cover) body.append("audio_cover", cover);

  return apiClient<ApiResponse<UploadedAudioFiles>>("/audio/upload-audio", {
    method: "POST",
    body,
  });
}

/**
 * Remove staged files that will never be published (dialog closed, file
 * replaced). The server only deletes URLs under the caller's own audio
 * prefixes and refuses files already tied to an audio.
 * Endpoint: POST /audio/delete-upload
 */
export function deleteAudioUploads(files: string[]) {
  return apiClient<ApiResponse<{ deleted: number }>>("/audio/delete-upload", {
    method: "POST",
    body: { files },
  });
}

/**
 * Publish a conversation from already-uploaded files. The server validates
 * that both URLs are on the CDN, under the caller's prefix and not used by
 * another audio. Answers 202 with `moderationStatus: "processing"`; content
 * moderation + ffmpeg run in the background.
 * Endpoint: POST /audio/create-audio
 */
export function createAudio(input: CreateAudioInput) {
  return apiClient<ApiResponse<RawAudio>>("/audio/create-audio", {
    method: "POST",
    body: input,
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
