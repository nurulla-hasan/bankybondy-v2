export type BondStatus =
  | "waiting"
  | "matched"
  | "ongoing"
  | "completed"
  | "paused";

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
  matchCount: number;
}

export interface MatchParticipant extends BondUser {
  offer: string;
  want: string;
}

export interface BondMatch {
  id: string;
  requestId: string;
  /** 0-100 strength score shown as a badge. */
  score: number;
  special?: MatchSpecial;
  participants: MatchParticipant[];
  createdAt: string;
}

export interface BondLink {
  id: string;
  name: string;
  status: "ongoing" | "completed";
  participants: BondUser[];
  createdAt: string;
  completedAt?: string;
  pendingRating?: boolean;
}
