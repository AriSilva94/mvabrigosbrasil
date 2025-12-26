import wpPostmeta from "@/data/wp/wp_postmeta.json";
import wpPostsVaga from "@/data/wp/wp_posts_vaga.json";
import type { WpPost, WpPostMeta, WpTable } from "@/types/database.types";
import type { VacancyProfile } from "@/types/vacancies.types";

type VacancyMeta = {
  cidade?: string;
  estado?: string;
  periodo?: string;
  carga_horaria?: string;
  abrigo?: string;
  habilidades_e_funcoes?: string;
  perfil_dos_voluntarios?: string;
  quantidade?: string;
  descricao?: string;
};

function isTable<T>(value: unknown, name: string): value is WpTable<T> {
  const candidate = value as Partial<WpTable<T>>;
  return (
    candidate?.type === "table" &&
    candidate?.name === name &&
    Array.isArray(candidate?.data)
  );
}

function cleanContent(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const normalized = raw.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function loadVacancyTables(): {
  postsTable: WpTable<WpPost> | undefined;
  metasTable: WpTable<WpPostMeta> | undefined;
} {
  const postsTable = (wpPostsVaga as unknown[]).find((item) =>
    isTable<WpPost>(item, "wp_posts")
  ) as WpTable<WpPost> | undefined;

  const metasTable = (wpPostmeta as unknown[]).find((item) =>
    isTable<WpPostMeta>(item, "wp_postmeta")
  ) as WpTable<WpPostMeta> | undefined;

  return { postsTable, metasTable };
}

function buildVacancyProfiles(): VacancyProfile[] {
  const { postsTable, metasTable } = loadVacancyTables();
  if (!postsTable?.data) return [];

  const posts = postsTable.data.filter(
    (entry) => entry?.post_type === "vaga" && entry?.post_status === "publish"
  );

  if (posts.length === 0) return [];

  const metaByPost = new Map<string, VacancyMeta>();

  metasTable?.data.forEach((meta) => {
    if (!meta?.post_id || !meta.meta_key) return;

    const current: VacancyMeta = metaByPost.get(meta.post_id) ?? {};
    current[meta.meta_key as keyof VacancyMeta] =
      meta.meta_value ?? undefined;
    metaByPost.set(meta.post_id, current);
  });

  return posts
    .map((entry) => {
      const meta = metaByPost.get(entry.ID) ?? {};
      return {
        id: entry.ID,
        title: entry.post_title ?? "Vaga",
        slug: entry.post_name ?? "",
        city: meta.cidade ?? undefined,
        state: meta.estado ?? undefined,
        period: meta.periodo ?? undefined,
        workload: meta.carga_horaria ?? undefined,
        shelter: meta.abrigo ?? undefined,
        skills: meta.habilidades_e_funcoes ?? undefined,
        volunteerProfile: meta.perfil_dos_voluntarios ?? undefined,
        quantity: meta.quantidade ?? undefined,
        description:
          cleanContent(entry.post_content) ?? cleanContent(meta.descricao),
      } satisfies VacancyProfile;
    })
    .filter((vacancy) => vacancy.slug !== "");
}

export function getVacancyProfileBySlug(slug: string): VacancyProfile | null {
  const vacancies = buildVacancyProfiles();
  return vacancies.find((vacancy) => vacancy.slug === slug) ?? null;
}

export function getVacanciesByShelterName(
  shelterName: string
): VacancyProfile[] {
  const normalizedShelter = normalizeName(shelterName);
  if (!normalizedShelter) return [];

  return buildVacancyProfiles().filter((vacancy) => {
    const normalizedVacancyShelter = vacancy.shelter
      ? normalizeName(vacancy.shelter)
      : "";
    return normalizedVacancyShelter === normalizedShelter;
  });
}
