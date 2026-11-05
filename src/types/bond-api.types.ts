import type { PaginationMeta } from "./api.types";

export type BondModality = "physical" | "online";

/** Backend bond request lifecycle values (bondRequest.enum.ts). */
export type RawBondRequestStatus =
  | "WAITING_FOR_LINK"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELED";

/**
 * Whitelisted fields returned by GET /bond-request/my-bond-requests.
 * Embedding vectors are projected out server-side; `location` may be present
 * for the owner but is not part of the UI contract yet.
 */
export interface RawBondRequest {
  _id: string;
  offer: string;
  want: string;
  description?: string;
  modality?: BondModality;
  radius?: number;
  status: RawBondRequestStatus;
  isPause: boolean;
  isLinked: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface RawBondRequestList {
  meta: PaginationMeta;
  result: RawBondRequest[];
}

export interface BondRequestQueryParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: string;
  /** Server-side filter (`QueryBuilder.filter()`); not part of the list page yet. */
  status?: RawBondRequestStatus;
}

export interface CreateBondRequestInput {
  offer: string;
  want: string;
  description?: string;
  modality?: BondModality;
  radius?: number;
}

/** Backend bond link lifecycle values (bondLink.enum.ts). */
export type RawBondLinkStatus = "Ongoing" | "Completed" | "Canceled";

/** Trimmed user embedded in populated bond links / matches. */
export interface RawBondUser {
  _id: string;
  name?: string;
  profile_image?: string;
  reputation?: { avg?: number; count?: number };
}

export interface RawBondLinkBond {
  _id: string;
  offer?: string;
  want?: string;
  user?: RawBondUser | string;
}

/**
 * GET /bond-link/my-bond-links returns the BondLink document with
 * `requestedBonds` populated (each with its owner). `participants` stays as
 * raw profile ids.
 */
export interface RawBondLink {
  _id: string;
  name: string;
  participants: string[];
  requestedBonds?: RawBondLinkBond[];
  status: RawBondLinkStatus;
  markAsCompletedBy?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface RawBondLinkList {
  meta: PaginationMeta;
  result: RawBondLink[];
}

export interface BondLinkQueryParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: string;
  status?: RawBondLinkStatus;
}

export interface CreateBondLinkInput {
  name: string;
  participants: string[];
  requestedBonds: string[];
}

/** Backend match classification (bondMatch.interface.ts). */
export type RawMatchType = "entry" | "surprise" | "empty";

export interface RawMatchRequest {
  _id: string;
  offer: string;
  want: string;
  user?: RawBondUser | string;
  /** Per-pair palette color served by the API. */
  offerColor?: string;
  wantColor?: string;
}

export interface RawBondMatch {
  matchRequest: RawMatchRequest[];
  /** 0..1 */
  matchScore: number;
  type: RawMatchType;
  isFullEmpty: boolean;
  size: number;
  /** Each factor is 0..1. */
  scoreParts: { sem: number; rep: number; prox: number; fresh: number };
}

/** GET /bond-request/matching-bond response body. */
export interface RawBondMatchList {
  status: "ready" | "computing";
  reactivated: boolean;
  total: number;
  page: number;
  limit: number;
  data: RawBondMatch[];
}

export interface BondMatchQueryParams {
  bondRequest: string;
  page?: number;
  limit?: number;
}
