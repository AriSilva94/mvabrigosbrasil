export const CACHE_TAGS = {
  volunteers: "volunteers",
  volunteer: (idOrSlug: string) => `volunteer:${idOrSlug}`,
  vacancies: "vacancies",
  vacancy: (idOrSlug: string) => `vacancy:${idOrSlug}`,
} as const;

export const DEFAULT_REVALIDATE_SECONDS = 3600;

export const PROGRAM_PAGE_PATH = "/programa-de-voluntarios";
