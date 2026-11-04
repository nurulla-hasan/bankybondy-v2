export type BondStatus =
  | "waiting"
  | "matched"
  | "ongoing"
  | "completed"
  | "paused"
  | "cancelled";

export type BondModality = "physical" | "online";

/** Backend wildcard tokens. The value stored is always the token, never the label. */
export type WildcardToken = "empty" | "surprise";

export type MatchSpecial = "gift" | "openSurprise" | "doubleSurprise";

export interface BondReputation {
  avg: number;
  count: number;
}

export interface BondUser {
  id: string;
  name: string;
  avatarUrl?: string;
  reputation?: BondReputation;
}

export interface BondRequest {
  id: string;
  offer: string;
  want: string;
  description: string;
  modality: BondModality;
  radiusKm?: number;
  status: BondStatus;
  createdAt: string;
  /** Not provided by the list endpoint yet; the card hides the chip when absent. */
  matchCount?: number;
}

export interface MatchParticipant extends BondUser {
  offer: string;
  want: string;
}

export interface MatchFactors {
  semantic: number;
  reputation: number;
  proximity: number;
  activity: number;
}

export interface BondMatch {
  id: string;
  /** Bond request the matches were computed for. */
  requestId: string;
  /** Bond request ids that form the exchange cycle, in cycle order. */
  bondIds: string[];
  /** Owner (profile) ids in the same order as `bondIds`. */
  participantIds: string[];
  /** 0-100 strength score shown as a badge. */
  score: number;
  factors?: MatchFactors;
  special?: MatchSpecial;
  participants: MatchParticipant[];
  /** Present on mock data; the matches endpoint does not expose a timestamp. */
  createdAt?: string;
}

export interface BondLink {
  id: string;
  name: string;
  status: "ongoing" | "completed" | "cancelled";
  participants: BondUser[];
  createdAt: string;
  completedAt?: string;
  pendingRating?: boolean;
}
