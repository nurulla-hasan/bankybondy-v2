import type { BondLink, BondMatch, BondRequest, BondUser } from "@/types";

const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 3_600_000).toISOString();
const daysAgo = (days: number) => hoursAgo(days * 24);

const users: Record<string, BondUser> = {
  ana: { id: "ana", name: "Ana Ríos", reputation: { avg: 4.9, count: 12 } },
  leo: { id: "leo", name: "Leo Márquez", reputation: { avg: 4.7, count: 8 } },
  mia: { id: "mia", name: "Mia Chen", reputation: { avg: 4.8, count: 21 } },
  diego: { id: "diego", name: "Diego Salas", reputation: { avg: 4.6, count: 5 } },
  sara: { id: "sara", name: "Sara Okafor", reputation: { avg: 5, count: 3 } },
  rafa: { id: "rafa", name: "Rafa Núñez", reputation: { avg: 4.4, count: 9 } },
  nadia: { id: "nadia", name: "Nadia Haddad", reputation: { avg: 4.9, count: 14 } },
  tomas: { id: "tomas", name: "Tomás Vidal", reputation: { avg: 4.5, count: 6 } },
  ines: { id: "ines", name: "Inés Duarte", reputation: { avg: 4.8, count: 11 } },
  marco: { id: "marco", name: "Marco Bianchi", reputation: { avg: 4.3, count: 4 } },
  june: { id: "june", name: "June Park", reputation: { avg: 4.9, count: 17 } },
};

export const mockBondRequests: BondRequest[] = [
  {
    id: "req-bike",
    offer: "Bike repair & tune-ups",
    want: "English conversation practice",
    description:
      "I can fix brakes, gears and flat tires. Looking for weekly English conversation to prepare for an interview.",
    modality: "physical",
    radiusKm: 20,
    status: "waiting",
    createdAt: hoursAgo(3),
    matchCount: 2,
  },
  {
    id: "req-design",
    offer: "Landing page design",
    want: "surprise",
    description:
      "One-page design in Figma for your project. Surprise me — anything handmade, homemade or unexpected is welcome.",
    modality: "online",
    status: "waiting",
    createdAt: daysAgo(1),
    matchCount: 1,
  },
  {
    id: "req-guitar",
    offer: "Guitar lessons",
    want: "Film photography walks",
    description:
      "Beginner to intermediate acoustic guitar, two sessions a week. I would love to learn analog photography in exchange.",
    modality: "physical",
    radiusKm: 10,
    status: "matched",
    createdAt: daysAgo(2),
    matchCount: 1,
  },
  {
    id: "req-sourdough",
    offer: "Sourdough starter & recipe",
    want: "empty",
    description:
      "Passing on a 3-year-old starter with a simple weekly routine. Open gift — take it and pass something forward later.",
    modality: "online",
    status: "paused",
    createdAt: daysAgo(4),
    matchCount: 0,
  },
  {
    id: "req-murals",
    offer:
      "Hand-painted custom murals for cafés, studios and community spaces, including design sketches and a weatherproof finish",
    want:
      "Monthly Spanish conversation sessions plus help setting up a small online shop for my hand-thrown ceramics collection",
    description:
      "I paint large-scale murals and would love a language exchange in return. Happy to travel around the city for the right collaboration.",
    modality: "physical",
    radiusKm: 15,
    status: "waiting",
    createdAt: hoursAgo(6),
    matchCount: 0,
  },
];

export const mockBondMatches: BondMatch[] = [
  {
    id: "match-repair-circle",
    requestId: "req-bike",
    score: 94,
    createdAt: hoursAgo(2),
    participants: [
      {
        ...users.ana,
        offer: "Bike repair",
        want: "English conversation",
      },
      {
        ...users.mia,
        offer: "English conversation",
        want: "Guitar lessons",
      },
      {
        ...users.leo,
        offer: "Guitar lessons",
        want: "Bike repair",
      },
    ],
  },
  {
    id: "match-camera-swap",
    requestId: "req-bike",
    score: 88,
    createdAt: hoursAgo(5),
    participants: [
      {
        ...users.diego,
        offer: "Weekend photography walk",
        want: "Bike repair",
      },
      {
        ...users.sara,
        offer: "Bike repair",
        want: "Weekend photography walk",
      },
    ],
  },
  {
    id: "match-open-surprise",
    requestId: "req-design",
    score: 91,
    special: "openSurprise",
    createdAt: daysAgo(1),
    participants: [
      {
        ...users.rafa,
        offer: "empty",
        want: "Landing page design",
      },
      {
        ...users.nadia,
        offer: "Landing page design",
        want: "surprise",
      },
    ],
  },
  {
    id: "match-films-guitar",
    requestId: "req-guitar",
    score: 86,
    createdAt: daysAgo(2),
    participants: [
      {
        ...users.tomas,
        offer:
          "Film photography walks through the old town with medium-format cameras and a short darkroom printing session",
        want: "Guitar lessons",
      },
      {
        ...users.ines,
        offer: "Guitar lessons",
        want: "Bread baking",
      },
      {
        ...users.marco,
        offer: "Bread baking",
        want:
          "Spanish lessons with a monthly conversation exchange focused on travel vocabulary and everyday small talk",
      },
      {
        ...users.june,
        offer: "Spanish lessons",
        want: "Bike repair",
      },
      {
        ...users.ana,
        offer: "Bike repair",
        want: "Film photography walk",
      },
    ],
  },
];

export const mockBondLinks: BondLink[] = [
  {
    id: "link-repair-circle",
    name: "Neighborhood repair circle",
    status: "ongoing",
    participants: [users.ana, users.mia, users.leo],
    createdAt: daysAgo(5),
  },
  {
    id: "link-camera-swap",
    name: "Camera swap",
    status: "ongoing",
    participants: [users.diego, users.sara],
    createdAt: daysAgo(2),
  },
  {
    id: "link-language",
    name: "Sunday language exchange",
    status: "completed",
    participants: [users.rafa, users.nadia],
    createdAt: daysAgo(10),
    completedAt: daysAgo(3),
    pendingRating: true,
  },
];
