export interface SearchPerson {
  _id: string;
  name: string;
  profile_image?: string;
}

export interface SearchUserSummary {
  _id: string;
  name: string;
  profile_image?: string;
}

export interface SearchBond {
  _id: string;
  offer: string;
  want: string;
  modality?: string;
  status?: string;
  user?: SearchUserSummary | null;
}

export interface SearchAudio {
  _id: string;
  title: string;
  cover_image?: string;
  duration?: number;
  user?: SearchUserSummary | null;
}

export interface GlobalSearchResult {
  people: SearchPerson[];
  bonds: SearchBond[];
  audios: SearchAudio[];
}
