/**
 * Forma calcada de `GET /audio/all-audios`: cada charla trae `user`,
 * `audioTopic`, `cover_image`, `audio_url`, `totalPlay`, `trendingScore`,
 * `averageRating`, `ratingCount`, `commentCount`, `topFeelings` y `tags`.
 * Al cablear el backend solo cambian los valores, no los componentes.
 */

export type MockTopicId =
  | "trueque"
  | "comunidad"
  | "amistad"
  | "creatividad"
  | "sustentabilidad"
  | "historias"
  | "preguntas";

export interface MockTopic {
  /** ObjectId de `audioTopic`. */
  id: string;
  name: string;
  image?: string;
  totalAudios: number;
}

export interface MockAuthor {
  /** `user._id`. */
  id: string;
  name: string;
  profileImage?: string;
}

export interface MockFeeling {
  /** Vocabulario cerrado de `feelingTags.ts`. */
  tag: string;
  count: number;
}

export interface MockConversation {
  /** `_id` del audio. */
  id: string;
  title: string;
  description: string;
  author: MockAuthor;
  /** `audioTopic` populado. */
  topic: MockTopic;
  /** `duration`, en segundos. */
  durationSec: number;
  coverImage?: string;
  audioUrl?: string;
  tags: string[];
  totalPlay: number;
  trendingScore: number;
  averageRating: number;
  ratingCount: number;
  commentCount: number;
  topFeelings: MockFeeling[];
  createdAt: string;
  /** Solo preview: relleno mientras `cover_image` está vacío. */
  gradient: string;
}

export const MOCK_TOPICS: Record<MockTopicId, MockTopic> = {
  trueque: { id: "topic-trueque", name: "Trueque", totalAudios: 186 },
  comunidad: { id: "topic-comunidad", name: "Comunidad", totalAudios: 152 },
  amistad: { id: "topic-amistad", name: "Amistad", totalAudios: 128 },
  creatividad: {
    id: "topic-creatividad",
    name: "Creatividad",
    totalAudios: 121,
  },
  sustentabilidad: {
    id: "topic-sustentabilidad",
    name: "Sustentabilidad",
    totalAudios: 97,
  },
  historias: { id: "topic-historias", name: "Historias", totalAudios: 214 },
  preguntas: { id: "topic-preguntas", name: "Preguntas", totalAudios: 169 },
};

export const MOCK_TOPIC_LIST: readonly MockTopic[] = Object.values(MOCK_TOPICS);

export const MOCK_TOPIC_ENTRIES: readonly {
  key: MockTopicId;
  topic: MockTopic;
}[] = (
  Object.entries(MOCK_TOPICS) as [MockTopicId, MockTopic][]
).map(([key, topic]) => ({ key, topic }));

/** `GET /audio/topics` (meta.totalCount) — acá, suma de `totalAudios`. */
export const MOCK_TOTAL_AUDIOS = MOCK_TOPIC_LIST.reduce(
  (total, topic) => total + topic.totalAudios,
  0,
);

const MOCK_FEATURED_CONVERSATION: MockConversation = {
  id: "audio-featured",
  title: "Cuando el trueque se vuelve amistad",
  description:
    "Valentina y Tomás se conocieron intercambiando libros. Hoy comparten un taller de encuadernación y una amistad de tres años.",
  author: { id: "user-valentina", name: "Valentina Ríos" },
  topic: MOCK_TOPICS.trueque,
  durationSec: 762,
  tags: ["trueque", "libros", "amistad"],
  totalPlay: 1240,
  trendingScore: 982,
  averageRating: 4.8,
  ratingCount: 96,
  commentCount: 12,
  topFeelings: [
    { tag: "cálido", count: 18 },
    { tag: "honesto", count: 11 },
    { tag: "inspirador", count: 7 },
  ],
  createdAt: "2026-11-07T18:30:00.000Z",
  gradient: "from-tone-violet/35 via-tone-sky/20 to-transparent",
};

export const MOCK_FEATURED = MOCK_FEATURED_CONVERSATION;

export const MOCK_CONVERSATIONS: readonly MockConversation[] = [
  MOCK_FEATURED_CONVERSATION,
  {
    id: "audio-02",
    title: "Lo que aprendí viviendo una semana sin plata",
    description:
      "Un experimento de trueque, favores y tiempo compartido que terminó cambiando la forma de medir la abundancia.",
    author: { id: "user-tomas", name: "Tomás Acuña" },
    topic: MOCK_TOPICS.sustentabilidad,
    durationSec: 932,
    tags: ["trueque", "vida simple"],
    totalPlay: 983,
    trendingScore: 871,
    averageRating: 4.5,
    ratingCount: 74,
    commentCount: 9,
    topFeelings: [
      { tag: "reflexivo", count: 14 },
      { tag: "valiente", count: 9 },
      { tag: "claro", count: 6 },
    ],
    createdAt: "2026-11-06T15:10:00.000Z",
    gradient: "from-tone-green/30 via-cyan-glow/15 to-transparent",
  },
  {
    id: "audio-03",
    title: "Dos desconocidos, una pregunta incómoda",
    description:
      "Camila le preguntó a un vecino qué necesita y no se lo esperaba. La charla que salió de ahí dura 10 minutos.",
    author: { id: "user-camila", name: "Camila Ferreyra" },
    topic: MOCK_TOPICS.preguntas,
    durationSec: 645,
    tags: ["barrio", "preguntas"],
    totalPlay: 1540,
    trendingScore: 940,
    averageRating: 4.7,
    ratingCount: 132,
    commentCount: 23,
    topFeelings: [
      { tag: "curioso", count: 21 },
      { tag: "emotivo", count: 12 },
      { tag: "genuino", count: 8 },
    ],
    createdAt: "2026-11-06T10:05:00.000Z",
    gradient: "from-tone-fuchsia/30 via-pink-accent/15 to-transparent",
  },
  {
    id: "audio-04",
    title: "El arte de pedir ayuda sin culpa",
    description:
      "Julián cuenta cómo pasó de resolver todo solo a sostener una red de intercambios con su barrio.",
    author: { id: "user-julian", name: "Julián Pardo" },
    topic: MOCK_TOPICS.historias,
    durationSec: 1120,
    tags: ["comunidad", "cuidados"],
    totalPlay: 764,
    trendingScore: 512,
    averageRating: 4.2,
    ratingCount: 48,
    commentCount: 14,
    topFeelings: [
      { tag: "honesto", count: 10 },
      { tag: "profundo", count: 9 },
      { tag: "agradecido", count: 5 },
    ],
    createdAt: "2026-11-05T19:40:00.000Z",
    gradient: "from-tone-amber/35 via-tone-orange/20 to-transparent",
  },
  {
    id: "audio-05",
    title: "Música, memoria y barrio",
    description:
      "Lucía armó una playlist con las canciones que su abuela cantaba en la feria. Después la compartió con todo el barrio.",
    author: { id: "user-lucia", name: "Lucía Núñez" },
    topic: MOCK_TOPICS.creatividad,
    durationSec: 840,
    tags: ["música", "memoria"],
    totalPlay: 1120,
    trendingScore: 723,
    averageRating: 4.6,
    ratingCount: 88,
    commentCount: 18,
    topFeelings: [
      { tag: "nostálgico", count: 16 },
      { tag: "cálido", count: 12 },
      { tag: "conmovedor", count: 9 },
    ],
    createdAt: "2026-11-04T12:20:00.000Z",
    gradient: "from-tone-sky/35 via-cyan-glow/15 to-transparent",
  },
  {
    id: "audio-06",
    title: "Criar en comunidad cuando no alcanza",
    description:
      "Mateo y tres familias comparten compras, cuidados y tardes de juegos. Una charla sobre redes que sostienen.",
    author: { id: "user-mateo", name: "Mateo Silva" },
    topic: MOCK_TOPICS.comunidad,
    durationSec: 1380,
    tags: ["familias", "cuidados"],
    totalPlay: 688,
    trendingScore: 480,
    averageRating: 4.3,
    ratingCount: 41,
    commentCount: 11,
    topFeelings: [
      { tag: "esperanzador", count: 11 },
      { tag: "tierno", count: 8 },
      { tag: "auténtico", count: 6 },
    ],
    createdAt: "2026-11-03T09:15:00.000Z",
    gradient: "from-tone-orange/35 via-tone-amber/15 to-transparent",
  },
  {
    id: "audio-07",
    title: "¿Cómo se construye confianza en una feria?",
    description:
      "Inés lleva diez años en la feria de su ciudad. Cuenta qué hace que alguien vuelva y qué lo espanta para siempre.",
    author: { id: "user-ines", name: "Inés Duarte" },
    topic: MOCK_TOPICS.trueque,
    durationSec: 725,
    tags: ["ferias", "confianza"],
    totalPlay: 1340,
    trendingScore: 655,
    averageRating: 4.4,
    ratingCount: 77,
    commentCount: 21,
    topFeelings: [
      { tag: "sabio", count: 13 },
      { tag: "claro", count: 10 },
      { tag: "sereno", count: 5 },
    ],
    createdAt: "2026-11-02T17:45:00.000Z",
    gradient: "from-tone-red/25 via-tone-amber/20 to-transparent",
  },
  {
    id: "audio-08",
    title: "La receta de mi abuela, otra vez",
    description:
      "Pedro perdió el cuaderno de recetas y reconstruyó una sopa de memoria. La conversación es sobre lo que queda.",
    author: { id: "user-pedro", name: "Pedro Molina" },
    topic: MOCK_TOPICS.historias,
    durationSec: 512,
    tags: ["recetas", "familia"],
    totalPlay: 452,
    trendingScore: 310,
    averageRating: 4.1,
    ratingCount: 29,
    commentCount: 6,
    topFeelings: [
      { tag: "nostálgico", count: 9 },
      { tag: "tierno", count: 7 },
      { tag: "íntimo", count: 5 },
    ],
    createdAt: "2026-11-01T11:30:00.000Z",
    gradient: "from-tone-violet/35 via-tone-fuchsia/15 to-transparent",
  },
  {
    id: "audio-09",
    title: "Diseñar sin comprar nada nuevo",
    description:
      "Sofía muestra cómo rescató materiales de descarte para equipar su taller de cerámica con cero presupuesto.",
    author: { id: "user-sofia", name: "Sofía Camargo" },
    topic: MOCK_TOPICS.creatividad,
    durationSec: 998,
    tags: ["reciclaje", "oficios"],
    totalPlay: 610,
    trendingScore: 402,
    averageRating: 4.5,
    ratingCount: 36,
    commentCount: 8,
    topFeelings: [
      { tag: "luminoso", count: 8 },
      { tag: "vibrante", count: 6 },
      { tag: "entusiasta", count: 5 },
    ],
    createdAt: "2026-10-30T16:00:00.000Z",
    gradient: "from-tone-sky/30 via-tone-green/15 to-transparent",
  },
];

export interface MockVoice {
  id: string;
  name: string;
  topicId: MockTopicId;
  conversations: number;
}

export const MOCK_VOICES: readonly MockVoice[] = [
  { id: "user-valentina", name: "Valentina Ríos", topicId: "trueque", conversations: 12 },
  { id: "user-camila", name: "Camila Ferreyra", topicId: "preguntas", conversations: 9 },
  { id: "user-julian", name: "Julián Pardo", topicId: "historias", conversations: 8 },
  { id: "user-lucia", name: "Lucía Núñez", topicId: "creatividad", conversations: 7 },
  { id: "user-ines", name: "Inés Duarte", topicId: "trueque", conversations: 6 },
];
