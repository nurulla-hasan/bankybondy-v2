import type { RawAudio, RawAudioFeeling } from "@/types";

/**
 * The feed row as the cards render it. The wire row is normalized once so the
 * UI never has to deal with a missing author/topic or a null description.
 */
export interface FeedAudio {
  id: string;
  title: string;
  description: string;
  author: { id: string; name: string; profileImage?: string };
  topic: { id: string; name: string };
  durationSec: number;
  coverImage?: string;
  audioUrl: string;
  tags: string[];
  totalPlay: number;
  averageRating: number;
  ratingCount: number;
  commentCount: number;
  topFeelings: RawAudioFeeling[];
  createdAt?: string;
  gradient: string;
}

/** Fallback art direction only when `cover_image` is empty. */
const GRADIENTS = [
  "from-tone-violet/35 via-tone-sky/20 to-transparent",
  "from-tone-green/30 via-cyan-glow/15 to-transparent",
  "from-tone-fuchsia/30 via-pink-accent/15 to-transparent",
  "from-tone-amber/35 via-tone-orange/20 to-transparent",
  "from-tone-sky/35 via-cyan-glow/15 to-transparent",
  "from-tone-orange/35 via-tone-amber/15 to-transparent",
  "from-tone-red/25 via-tone-amber/20 to-transparent",
] as const;

/** A populated row can lose its author or topic; such a row is not renderable. */
export function toFeedAudio(audio: RawAudio, index = 0): FeedAudio | null {
  if (!audio.user || !audio.audioTopic || !audio.audio_url) return null;

  return {
    id: audio._id,
    title: audio.title,
    description: audio.description ?? "",
    author: {
      id: audio.user._id,
      name: audio.user.name,
      profileImage: audio.user.profile_image,
    },
    topic: { id: audio.audioTopic._id, name: audio.audioTopic.name },
    durationSec: Math.max(0, Math.round(audio.duration)),
    coverImage: audio.cover_image || undefined,
    audioUrl: audio.audio_url,
    tags: audio.tags ?? [],
    totalPlay: audio.totalPlay,
    averageRating: audio.averageRating,
    ratingCount: audio.ratingCount,
    commentCount: audio.commentCount,
    topFeelings: audio.topFeelings ?? [],
    createdAt: audio.createdAt,
    gradient: GRADIENTS[index % GRADIENTS.length],
  };
}

export interface FeedVoice {
  id: string;
  name: string;
  profileImage?: string;
  topicName: string;
  count: number;
}

/** The backend has no "top publisher" endpoint; count the loaded page instead. */
export function toFeedVoices(
  items: readonly FeedAudio[],
  limit = 5,
): FeedVoice[] {
  const byAuthor = new Map<string, FeedVoice>();

  for (const item of items) {
    const voice = byAuthor.get(item.author.id);
    if (voice) {
      voice.count += 1;
    } else {
      byAuthor.set(item.author.id, {
        id: item.author.id,
        name: item.author.name,
        profileImage: item.author.profileImage,
        topicName: item.topic.name,
        count: 1,
      });
    }
  }

  return [...byAuthor.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
