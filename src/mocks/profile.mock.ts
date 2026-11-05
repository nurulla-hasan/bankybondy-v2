/**
 * Temporary mock fixtures for the profile/settings UI pass. Delete this folder
 * when the real `useMyProfile` / `useUpdateMyProfile` hooks land.
 */
import type {
  MyProfile,
  RawPublicBond,
  RawPublicRating,
  RawPersonSkill,
} from "@/types";

const skill = (_id: string, name: string): RawPersonSkill => ({ _id, name });

const SKILL_ID = (seed: string) => seed.padEnd(24, "0");

export const MOCK_SKILLS: RawPersonSkill[] = [
  skill(SKILL_ID("6521a1"), "Diseño UX"),
  skill(SKILL_ID("6521a2"), "Traducción ES-EN"),
  skill(SKILL_ID("6521a3"), "Fotografía de producto"),
  skill(SKILL_ID("6521a4"), "Community management"),
  skill(SKILL_ID("6521a5"), "Ilustración editorial"),
  skill(SKILL_ID("6521a6"), "Montaje de vídeo"),
  skill(SKILL_ID("6521a7"), "Contabilidad básica"),
];

export const MOCK_PROFILE: MyProfile = {
  _id: "66f0a1b2c3d4e5f601020304",
  user: "66f0a1b2c3d4e5f609080706",
  name: "Nadia Rahman",
  email: "nadia.rahman@example.com",
  phone: "+34 612 334 455",
  profile_image: "/mock/avatar-nadia.svg",
  cover_image: "/mock/cover-workspace.svg",
  gender: "FEMALE",
  dateOfBirth: "1993-04-17",
  address: "València, España",
  bio: "Diseñadora e ilustradora. Cambio sesiones de diseño y traducción por fotografía, montaje de vídeo o cualquier cosa que haga avanzar mi proyecto. Respondo en menos de 24 h y cumplo las fechas.",
  skills: MOCK_SKILLS.slice(0, 6),
  socialLinks: [
    "https://www.behance.net/nadiarahman",
    "https://instagram.com/nadia.illustra",
    "https://linkedin.com/in/nadiarahman",
  ],
  bondsPublic: true,
  listedInPeople: true,
  reputation: { avg: 4.7, count: 12, score: 56 },
  subscriptionType: "Premium",
  bondLimit: 12,
  createdAt: "2025-02-11T09:24:00.000Z",
  updatedAt: "2026-10-28T16:05:00.000Z",
};

export const MOCK_BONDS: RawPublicBond[] = [
  {
    _id: "6711b0000000000000000001",
    offer: "2 sesiones de diseño de interfaz",
    want: "Sesión de fotos de producto",
    description: "Busco alguien con cámara propia para las fotos de mi catálogo.",
    modality: "PHYSICAL",
    radius: 25,
    status: "ONGOING",
    createdAt: "2026-10-19T10:00:00.000Z",
  },
  {
    _id: "6711b0000000000000000002",
    offer: "surprise",
    want: "Asesoría legal exprés para autónomos",
    modality: "ONLINE",
    status: "WAITING_FOR_LINK",
    createdAt: "2026-10-30T08:30:00.000Z",
  },
  {
    _id: "6711b0000000000000000003",
    offer: "Ilustración de portada para libro",
    want: "empty",
    description: "Regalo una portada a quien la necesite este mes.",
    modality: "ONLINE",
    status: "COMPLETED",
    createdAt: "2026-08-02T14:10:00.000Z",
  },
  {
    _id: "6711b0000000000000000004",
    offer: "Traducción de catálogo (500 palabras)",
    want: "Revisión de mi CV en inglés",
    modality: "ONLINE",
    status: "ONGOING",
    createdAt: "2026-10-05T18:45:00.000Z",
  },
  {
    _id: "6711b0000000000000000005",
    offer: "Clases de guitarra para principiantes",
    want: "Intercambio de libros de no-ficción",
    modality: "PHYSICAL",
    radius: 10,
    status: "CANCELED",
    createdAt: "2026-07-21T11:20:00.000Z",
  },
];

const rater = (
  _id: string,
  name: string,
  profile_image?: string,
): RawPublicRating["ratedBy"] => ({
  _id,
  name,
  profile_image,
  reputation: { avg: 4.5, count: 7 },
});

export const MOCK_REVIEWS: RawPublicRating[] = [
  {
    _id: "6711c0000000000000000001",
    rating: 5,
    comment:
      "Entregó la interfaz antes de lo previsto y explicó cada decisión. Repetiría sin dudar.",
    offer: "2 sesiones de diseño de interfaz",
    want: "Sesión de fotos de producto",
    ratedBy: rater("66f0a1b2c3d4e5f611111111", "Marta Cebrián"),
    createdAt: "2026-10-24T09:15:00.000Z",
  },
  {
    _id: "6711c0000000000000000002",
    rating: 5,
    comment: "Traducción impecable, comunicación clara durante todo el cambio.",
    offer: "Traducción de catálogo (500 palabras)",
    want: "Revisión de mi CV en inglés",
    ratedBy: rater(
      "66f0a1b2c3d4e5f622222222",
      "Tomás Iriarte",
      "/mock/avatar-nadia.svg",
    ),
    createdAt: "2026-09-30T17:40:00.000Z",
  },
  {
    _id: "6711c0000000000000000003",
    rating: 4,
    comment: "Muy buen trabajo; sólo tardó un día más de lo acordado.",
    want: "Clases de guitarra para principiantes",
    ratedBy: null,
    createdAt: "2026-08-14T12:00:00.000Z",
  },
];

export function mockDelay<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}
