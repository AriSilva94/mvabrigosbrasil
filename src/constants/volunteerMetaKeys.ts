export const VOLUNTEER_META_KEYS = {
  CITY: "cidade",
  STATE: "estado",
  GENDER: "genero",
  AVAILABILITY: "disponibilidade",
  PROFESSION: "profissao",
  SCHOOLING: "escolaridade",
  EXPERIENCE: "experiencia",
  SKILLS: "descricao",
  PERIOD: "periodo",
  NOTES: "comentarios",
} as const;

export type VolunteerMetaKey = typeof VOLUNTEER_META_KEYS[keyof typeof VOLUNTEER_META_KEYS];
