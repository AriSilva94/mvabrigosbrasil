export type WpPost = {
  ID: string;
  post_author: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  comment_status: string;
  ping_status: string;
  post_password: string;
  post_name: string;
  to_ping: string;
  pinged: string;
  post_modified: string;
  post_modified_gmt: string;
  post_content_filtered: string;
  post_parent: string;
  guid: string;
  menu_order: string;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
};

export type WpPostMeta = {
  meta_id: string;
  post_id: string;
  meta_key: string;
  meta_value: string | null;
};

export type ShelterRecord = {
  id: number;
  title: string;
  postDate: string;
  year: number;
  month: number;
  state?: string;
  type?: string;
};

export type MovementMetrics = {
  entradas: number;
  entradasGatos: number;
  adocoes: number;
  adocoesGatos: number;
  devolucoes: number;
  devolucoesGatos: number;
  eutanasias: number;
  eutanasiasGatos: number;
  mortesNaturais: number;
  mortesNaturaisGatos: number;
  retornoTutor: number;
  retornoTutorGatos: number;
  retornoLocal: number;
  retornoLocalGatos: number;
};

export type MovementRecord = {
  id: number;
  postType: "dinamica" | "dinamica_lar";
  year: number;
  month: number;
  shelterId: number | null;
  shelterState?: string;
  shelterType?: string;
  metrics: MovementMetrics;
};

export type DatabaseDataset = {
  shelters: ShelterRecord[];
  movements: MovementRecord[];
  years: number[];
  states: string[];
};

export type OverviewMetrics = {
  totalShelters: number;
  publicCount: number;
  privateCount: number;
  mixedCount: number;
  ltpiCount: number;
};

export type MonthlyAnimalFlow = {
  month: number;
  label: string;
  entradas: number;
  adocoes: number;
  devolucoes: number;
  eutanasias: number;
  mortesNaturais: number;
  retornoTutor: number;
  retornoLocal: number;
};
