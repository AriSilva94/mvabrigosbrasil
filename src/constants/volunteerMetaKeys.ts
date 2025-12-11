export const VOLUNTEER_META_KEYS = {
  CITY: "cidade",
  STATE: "estado",
  GENDER: "genero",
  AVAILABILITY: "disponibilidade",
} as const;

export type VolunteerMetaKey = typeof VOLUNTEER_META_KEYS[keyof typeof VOLUNTEER_META_KEYS];
