export const CACHE_TAGS = {
  volunteersPublic: "volunteers-public",
  vacanciesPublic: "vacancies-public",
  databaseDataset: "database-dataset",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
