import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AudioFeedbackInput,
  AudioFeedbackList,
  AudioListQueryParams,
  AudioModerationResult,
  CreateAudioInput,
  RawAudio,
  RawAudioBookmark,
  RawAudioComment,
  RawAudioDetail,
  RawAudioList,
  RawMyAudio,
  RawMyAudioList,
  RecordAudioListenInput,
  UpdateAudioFiles,
  UpdateAudioInput,
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

/**
 * One conversation with its aggregates and, when signed in, the viewer's own
 * rating/comment. Non-`ready` audios are only visible to their owner.
 * Endpoint: GET /audio/single-audio/:audioId
 */
export function getAudioDetail(audioId: string) {
  return apiClient<ApiResponse<RawAudioDetail>>(
    `/audio/single-audio/${encodeURIComponent(audioId)}`,
    { method: "GET" },
  );
}

/**
 * Paginated comments of one conversation plus feeling totals. "Load more"
 * raises `limit` instead of paginating by page.
 * Endpoint: GET /audio/:audioId/feedback
 */
export function getAudioFeedback(
  audioId: string,
  params?: { page?: number; limit?: number },
) {
  return apiClient<ApiResponse<AudioFeedbackList>>(
    `/audio/${encodeURIComponent(audioId)}/feedback`,
    { method: "GET", query: params },
  );
}

/** Controlled feeling vocabulary (accented display labels). */
export function getFeelingTags() {
  return apiClient<ApiResponse<string[]>>("/audio/feeling-tags", {
    method: "GET",
  });
}

/**
 * One rating per listener; the server refuses a second one and self-ratings.
 * Endpoint: POST /audio/give-rating/:audioId
 */
export function giveAudioRating(audioId: string, rating: number) {
  return apiClient<ApiResponse<RawAudio>>(
    `/audio/give-rating/${encodeURIComponent(audioId)}`,
    { method: "POST", body: { rating } },
  );
}

/**
 * Upserts the caller's comment + feeling tags on a conversation.
 * Endpoint: POST /audio/:audioId/feedback
 */
export function saveAudioFeedback(
  audioId: string,
  input: AudioFeedbackInput,
) {
  return apiClient<ApiResponse<RawAudioComment>>(
    `/audio/${encodeURIComponent(audioId)}/feedback`,
    { method: "POST", body: input },
  );
}

/**
 * The caller's own conversations, every moderation status included.
 * Endpoint: GET /audio/my-audios
 */
export function getMyAudios(params?: AudioListQueryParams) {
  return apiClient<ApiResponse<RawMyAudioList>>("/audio/my-audios", {
    method: "GET",
    query: params,
  });
}

/**
 * Updates text fields and/or replaces the media. Multipart on purpose: the
 * uploader middleware expects `data` (JSON) plus optional `audio`/`audio_cover`
 * files. Replacing the audio re-runs moderation on the server.
 * Endpoint: PATCH /audio/update-audio/:audioId
 */
export function updateAudio(
  audioId: string,
  input: UpdateAudioInput,
  files: UpdateAudioFiles = {},
) {
  const body = new FormData();
  body.append("data", JSON.stringify(input));
  if (files.audio) body.append("audio", files.audio);
  if (files.cover) body.append("audio_cover", files.cover);

  return apiClient<ApiResponse<RawMyAudio>>(
    `/audio/update-audio/${encodeURIComponent(audioId)}`,
    { method: "PATCH", body },
  );
}

/** Endpoint: DELETE /audio/delete-audio/:audioId */
export function deleteAudio(audioId: string) {
  return apiClient<ApiResponse<RawMyAudio>>(
    `/audio/delete-audio/${encodeURIComponent(audioId)}`,
    { method: "DELETE" },
  );
}
