import type { PaginationMeta } from "./api.types";

/** `audio.interface.ts` `ENUM_AUDIO_MODERATION_STATUS`. */
export type AudioModerationStatus =
  | "processing"
  | "ready"
  | "rejected"
  | "failed";

/** The author projection `getAllAudios` populates from `NormalUser`. */
export interface RawAudioAuthor {
  _id: string;
  name: string;
  profile_image?: string;
}

/** `topic.model.ts` — the catalog a conversation belongs to. */
export interface RawAudioTopic {
  _id: string;
  name: string;
  topic_image: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * `GET /topic/all-topics` computes `totalAudios` with `$lookup` on the audios
 * collection (`topic.service.ts` `getAllTopics`).
 */
export interface RawAudioTopicWithCount extends RawAudioTopic {
  totalAudios: number;
}

export interface RawAudioFeeling {
  tag: string;
  count: number;
}

/**
 * One row of `GET /audio/all-audios`. `audio_url`/`cover_image` arrive signed
 * for one hour (`withSignedMedia` → `signedUrl.ts`), `user` and `audioTopic` are
 * populated, and `averageRating`/`commentCount`/`topFeelings` are added by the
 * service after the page is read (`audio.service.ts` `getAllAudios`).
 */
export interface RawAudio {
  _id: string;
  user: RawAudioAuthor | null;
  audioTopic: RawAudioTopic | null;
  title: string;
  description?: string;
  audio_url: string;
  cover_image: string;
  tags: string[];
  totalPlay: number;
  trendingScore: number;
  duration: number;
  totalRating: number;
  ratingCount: number;
  isBlocked: boolean;
  moderationStatus: AudioModerationStatus;
  createdAt?: string;
  updatedAt?: string;
  averageRating: number;
  commentCount: number;
  topFeelings: RawAudioFeeling[];
}

export interface RawAudioList {
  meta: PaginationMeta;
  result: RawAudio[];
}

/**
 * `GET /topic/all-topics` answers `{ meta: { ..., totalCount }, result }` inside
 * `data` — note `totalCount`, not `total` (`topic.service.ts`).
 */
export interface TopicListMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface RawAudioTopicList {
  meta: TopicListMeta;
  result: RawAudioTopicWithCount[];
}

/**
 * `GET /audio-bookmark/my-bookmark-audios`. The bookmark populates `audio`
 * (with its `audioTopic`) but not the audio's author, so only `_id` is
 * guaranteed here — the feed carries the full row.
 */
export interface RawAudioBookmark {
  _id: string;
  audio: Pick<RawAudio, "_id">;
  createdAt?: string;
  updatedAt?: string;
}

/** `GET /audio/moderation-status/:audioId` (polling after an upload). */
export interface AudioModerationResult {
  _id: string;
  moderationStatus: AudioModerationStatus;
  moderationReason: string;
}

/** Files staged by `POST /audio/upload-audio`; either side may be null. */
export interface UploadedAudioFiles {
  audio_url: string | null;
  cover_image: string | null;
}

/** Fields the uploader posts to `POST /audio/create-audio` as JSON. */
export interface CreateAudioInput {
  title: string;
  description: string;
  audioTopic: string;
  tags: string[];
  duration: number;
  audio_url: string;
  cover_image: string;
}

/** `POST /audio/:audioId/listen` — the server decides if the listen qualifies. */
export interface RecordAudioListenInput {
  secondsListened: number;
  completion: number;
}

export type AudioFeedSort = "-createdAt" | "-trendingScore" | "-totalPlay";

export interface AudioListQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: AudioFeedSort;
  audioTopic?: string;
}

export interface TopicListQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}
