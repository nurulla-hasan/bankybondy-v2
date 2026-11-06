import type { RawChatMessage, RawConversationListItem } from "@/types";

/** MOCK-ONLY: phase 2 takes the signed-in profile id from `useAuth().user._id`. */
export const MOCK_ME_ID = "u-me";

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const person = (id: string, name: string) => ({ _id: id, name });

const ME = { _id: MOCK_ME_ID, name: "You" };
const ANA = person("u-ana", "Ana Beltrán");
const BRUNO = person("u-bruno", "Bruno Salas");
const SOFIA = person("u-sofia", "Sofía Ramírez");
const DIEGO = person("u-diego", "Diego Fontán");
const LUCIA = person("u-lucia", "Lucía Moreno");
const MATEO = person("u-mateo", "Mateo Iglesias");

type Seed = {
  from: { _id: string; name: string };
  minutes: number;
  text?: string;
  images?: number;
  pdfs?: number;
  deleted?: boolean;
};

/**
 * `GET /message/get-messages` answers newest-first, so the store keeps the
 * natural reading order here and the gateway reverses it on the way out — that
 * way the paging fix in phase 2 is already exercised.
 */
function message(conversationId: string, seed: Seed, index: number): RawChatMessage {
  const deleted = Boolean(seed.deleted);

  return {
    _id: `m-${conversationId}-${index}`,
    text: deleted ? null : (seed.text ?? null),
    imageUrl: deleted || !seed.images ? [] : seedAttachments(seed.images),
    videoUrl: [],
    pdfUrl:
      deleted || !seed.pdfs
        ? []
        : Array.from({ length: seed.pdfs }, (_, index) => `mock://document-${index + 1}.pdf`),
    msgByUserId: seed.from._id,
    conversationId,
    createdAt: minutesAgo(seed.minutes),
    isDeleted: deleted,
    userDetails: { name: seed.from.name, profile_image: undefined },
    isMyMessage: seed.from._id === MOCK_ME_ID,
  };
}

/**
 * MOCK-ONLY: uploads return CloudFront URLs. These are inline SVGs so the real
 * `<img>` path is exercised, and phase 2 needs no component change.
 */
function seedAttachments(count: number) {
  return Array.from({ length: count }, (_, index) => seedImage(index));
}

const SEED_TONES = ["#94a3b8", "#a5b4fc", "#fda4af", "#86efac"];

function seedImage(index: number) {
  const tone = SEED_TONES[index % SEED_TONES.length];

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 120'%3E%3Crect width='160' height='120' fill='${tone}'/%3E%3C/svg%3E`;
}

function thread(
  conversationId: string,
  seeds: Seed[],
): RawChatMessage[] {
  return seeds.map((seed, index) => message(conversationId, seed, index));
}

export const MOCK_CONVERSATIONS: RawConversationListItem[] = [
  {
    _id: "c-ana",
    type: "one-two-one",
    userData: ANA,
    lastMessage: message("c-ana", { from: ANA, minutes: 12, text: "¿Te viene bien el jueves?" }, 5),
    created_at: minutesAgo(60 * 24 * 9),
    updated_at: minutesAgo(12),
    unseenMsg: 7,
    members: [ME, ANA],
  },
  {
    _id: "c-crew",
    type: "chat-group",
    userData: null,
    chatGroup: { _id: "g-crew", name: "Textile co-op", image: undefined },
    lastMessage: message("c-crew", { from: LUCIA, minutes: 42, text: "Subí las fotos del taller 📸" }, 6),
    created_at: minutesAgo(60 * 24 * 30),
    updated_at: minutesAgo(42),
    unseenMsg: 120,
    members: [ME, LUCIA, DIEGO, SOFIA, ANA, MATEO],
  },
  {
    _id: "c-bond-maria",
    type: "bond-link-group",
    userData: null,
    bondLink: { _id: "bl-1", name: "Logo swap with Bruno", status: "Completed" },
    lastMessage: message("c-bond-maria", { from: BRUNO, minutes: 60 * 20, text: "Cerrado entonces, ¡gracias!" }, 3),
    created_at: minutesAgo(60 * 24 * 12),
    updated_at: minutesAgo(60 * 20),
    unseenMsg: 0,
    members: [ME, BRUNO],
  },
  {
    _id: "c-bruno",
    type: "one-two-one",
    userData: BRUNO,
    lastMessage: message("c-bruno", { from: ME, minutes: 180, text: "Te mando la propuesta mañana temprano" }, 2),
    created_at: minutesAgo(60 * 24 * 4),
    updated_at: minutesAgo(180),
    unseenMsg: 0,
    members: [ME, BRUNO],
  },
  {
    _id: "c-studio",
    type: "chat-group",
    userData: null,
    chatGroup: { _id: "g-studio", name: "Studio share", image: undefined },
    lastMessage: message("c-studio", { from: DIEGO, minutes: 60 * 6, images: 2 }, 2),
    created_at: minutesAgo(60 * 24 * 20),
    updated_at: minutesAgo(60 * 6),
    unseenMsg: 0,
    members: [ME, DIEGO, SOFIA],
  },
  {
    _id: "c-sofia",
    type: "one-two-one",
    userData: SOFIA,
    lastMessage: message("c-sofia", { from: SOFIA, minutes: 60 * 20, text: "¿Te encaja el precio?" }, 3),
    created_at: minutesAgo(60 * 24 * 6),
    updated_at: minutesAgo(60 * 20),
    unseenMsg: 1,
    members: [ME, SOFIA],
  },
  {
    _id: "c-deleted",
    type: "one-two-one",
    userData: MATEO,
    // The chat list ships lastMessage raw, so a deleted message still carries
    // its text here — the row has to hide it (`conversation.service.ts:81-94`).
    lastMessage: {
      ...message("c-deleted", { from: MATEO, minutes: 60 * 49, text: "this should not be readable" }, 1),
      isDeleted: true,
    },
    created_at: minutesAgo(60 * 24 * 3),
    updated_at: minutesAgo(60 * 49),
    unseenMsg: 0,
    members: [ME, MATEO],
  },
  {
    _id: "c-empty",
    type: "one-two-one",
    userData: LUCIA,
    lastMessage: null,
    created_at: minutesAgo(60 * 24 * 8),
    updated_at: minutesAgo(60 * 24 * 8),
    unseenMsg: 0,
    members: [ME, LUCIA],
  },
];

export const MOCK_THREADS: Record<string, RawChatMessage[]> = {
  "c-ana": thread("c-ana", [
    { from: ANA, minutes: 60 * 29, text: "Hola! Vi tu perfil, haces tejido?" },
    { from: ME, minutes: 60 * 28, text: "Sí, hace años. ¿Vos también?" },
    { from: ANA, minutes: 60 * 27, text: "Tejiendo desde que aprendí. Busco alguien para un intercambio: telar por edición." },
    { from: ME, minutes: 60 * 26, text: "Me interesa. Te paso mis trabajos cuando termine el que está abierto." },
    { from: ME, minutes: 60 * 24, text: "Estas dos son del último lote", images: 2 },
    { from: ANA, minutes: 55, text: "Perfecto. ¿Te viene bien el jueves?" },
    { from: ANA, minutes: 12, text: "¿Te viene bien el jueves?" },
  ]),
  "c-crew": thread("c-crew", [
    { from: LUCIA, minutes: 60 * 50, text: "Abrimos el grupo para lo del taller del sábado" },
    { from: DIEGO, minutes: 60 * 49, text: "Llevo la máquina de coser" },
    { from: SOFIA, minutes: 60 * 47, text: "Yo llevo tela, ¿cuánta hace falta?" },
    { from: ME, minutes: 60 * 46, text: "Con tres metros por persona sobra" },
    { from: LUCIA, minutes: 60 * 30, deleted: true },
    { from: ANA, minutes: 90, images: 3 },
    { from: LUCIA, minutes: 42, text: "Subí las fotos del taller 📸" },
  ]),
  "c-bond-maria": thread("c-bond-maria", [
    { from: BRUNO, minutes: 60 * 24 * 3, text: "Cerramos el vínculo cuando entregues los archivos" },
    { from: ME, minutes: 60 * 24 * 2, pdfs: 1 },
    { from: BRUNO, minutes: 60 * 21, text: "Recibido, todo ok" },
    { from: BRUNO, minutes: 60 * 20, text: "Cerrado entonces, ¡gracias!" },
  ]),
  "c-bruno": thread("c-bruno", [
    { from: BRUNO, minutes: 60 * 24 * 2, text: "¿Cómo va lo del sitio?" },
    { from: ME, minutes: 240, text: "Aquí tienes el presupuesto cerrado", pdfs: 1 },
    { from: BRUNO, minutes: 200, text: "Genial, lo miro esta noche" },
    { from: ME, minutes: 180, text: "Te mando la propuesta mañana temprano" },
  ]),
  "c-studio": thread("c-studio", [
    { from: DIEGO, minutes: 60 * 30, text: "El estudio está libre el martes a la tarde" },
    { from: SOFIA, minutes: 60 * 20, text: "Yo puedo" },
    { from: DIEGO, minutes: 60 * 6, images: 2 },
  ]),
  "c-sofia": thread("c-sofia", [
    { from: SOFIA, minutes: 60 * 26, pdfs: 1 },
    { from: SOFIA, minutes: 60 * 26, text: "Te paso el presupuesto en PDF" },
    { from: ME, minutes: 60 * 24, text: "Lo abrí, me sirve", images: 1 },
    { from: SOFIA, minutes: 60 * 20, text: "¿Te encaja el precio?" },
  ]),
  "c-deleted": thread("c-deleted", [
    { from: ME, minutes: 60 * 50, text: "¿Todavía tenés el telar grande?" },
    { from: MATEO, minutes: 60 * 49, text: "this should not be readable", deleted: true },
  ]),
  "c-empty": [],
};
