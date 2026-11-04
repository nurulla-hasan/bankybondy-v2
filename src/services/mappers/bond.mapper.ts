import type {
  BondLink,
  BondMatch,
  BondRequest,
  BondUser,
  MatchParticipant,
  MatchSpecial,
  RawBondLink,
  RawBondLinkStatus,
  RawBondMatch,
  RawBondRequest,
  RawBondRequestStatus,
  RawBondUser,
} from "@/types";

const REQUEST_STATUS_MAP: Record<RawBondRequestStatus, BondRequest["status"]> = {
  WAITING_FOR_LINK: "waiting",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELED: "cancelled",
};

const LINK_STATUS_MAP: Record<RawBondLinkStatus, BondLink["status"]> = {
  Ongoing: "ongoing",
  Completed: "completed",
  Canceled: "cancelled",
};

const SURPRISE_TOKEN = "surprise";

const normalizeToken = (value?: string) => (value ?? "").trim().toLowerCase();

const toPercent = (value: number) =>
  Math.round(Math.max(0, Math.min(1, value)) * 100);

export function mapBondRequest(raw: RawBondRequest): BondRequest {
  return {
    id: raw._id,
    offer: raw.offer,
    want: raw.want,
    description: raw.description ?? "",
    modality: raw.modality ?? "physical",
    radiusKm: raw.radius,
    status: raw.isPause ? "paused" : REQUEST_STATUS_MAP[raw.status],
    createdAt: raw.createdAt,
  };
}

function resolveUser(raw: RawBondUser | string | undefined): BondUser | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const reputation =
    typeof raw.reputation?.avg === "number" &&
    typeof raw.reputation?.count === "number"
      ? { avg: raw.reputation.avg, count: raw.reputation.count }
      : undefined;

  return {
    id: raw._id,
    name: raw.name ?? "",
    avatarUrl: raw.profile_image,
    reputation,
  };
}

export function mapBondLink(raw: RawBondLink): BondLink {
  const seen = new Set<string>();
  const participants: BondUser[] = [];

  for (const bond of raw.requestedBonds ?? []) {
    const user = resolveUser(bond.user);
    if (user && !seen.has(user.id)) {
      seen.add(user.id);
      participants.push(user);
    }
  }

  // The create response is not populated; fall back to raw participant ids.
  if (!participants.length) {
    for (const id of raw.participants ?? []) {
      if (!seen.has(id)) {
        seen.add(id);
        participants.push({ id, name: "" });
      }
    }
  }

  return {
    id: raw._id,
    name: raw.name,
    status: LINK_STATUS_MAP[raw.status],
    participants,
    createdAt: raw.createdAt,
  };
}

function resolveSpecial(
  raw: RawBondMatch,
  participants: MatchParticipant[],
): MatchSpecial | undefined {
  if (raw.type === "empty" || raw.isFullEmpty) return "gift";
  if (raw.type !== "surprise") return undefined;

  const hasSurprise = participants.some(
    (participant) =>
      normalizeToken(participant.offer) === SURPRISE_TOKEN ||
      normalizeToken(participant.want) === SURPRISE_TOKEN,
  );
  if (!hasSurprise) return undefined;

  // Double surprise = a pair where one side's want and the previous side's
  // offer are both the 'surprise' token (same cycle rule as the backend).
  const isDouble = participants.some((participant, index) => {
    const previous =
      participants[(index - 1 + participants.length) % participants.length];

    return (
      normalizeToken(participant.want) === SURPRISE_TOKEN &&
      normalizeToken(previous.offer) === SURPRISE_TOKEN
    );
  });

  return isDouble ? "doubleSurprise" : "openSurprise";
}

export function mapBondMatch(
  raw: RawBondMatch,
  requestId: string,
): BondMatch {
  const participants: MatchParticipant[] = raw.matchRequest.map((entry) => {
    const user = resolveUser(entry.user);

    return {
      id: user?.id ?? entry._id,
      name: user?.name ?? "",
      avatarUrl: user?.avatarUrl,
      reputation: user?.reputation,
      offer: entry.offer,
      want: entry.want,
    };
  });

  const bondIds = raw.matchRequest.map((entry) => entry._id);
  const participantIds = participants.map((participant) => participant.id);

  return {
    id: [...bondIds].sort().join("|"),
    requestId,
    bondIds,
    participantIds,
    score: toPercent(raw.matchScore),
    factors: {
      semantic: toPercent(raw.scoreParts.sem),
      reputation: toPercent(raw.scoreParts.rep),
      proximity: toPercent(raw.scoreParts.prox),
      activity: toPercent(raw.scoreParts.fresh),
    },
    special: resolveSpecial(raw, participants),
    participants,
  };
}
