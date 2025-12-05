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

export function getVacancyProfileBySlug(slug: string): VacancyProfile | null {
  const postsTable = (wpPostsVaga as unknown[]).find((item) =>
    isTable<WpPost>(item, "wp_posts")
  ) as WpTable<WpPost> | undefined;

  const metasTable = (wpPostmeta as unknown[]).find((item) =>
    isTable<WpPostMeta>(item, "wp_postmeta")
  ) as WpTable<WpPostMeta> | undefined;

  if (!postsTable?.data) return null;

  const post =
    postsTable.data.find(
      (entry) =>
        entry?.post_type === "vaga" &&
        entry?.post_status === "publish" &&
        entry?.post_name === slug
    ) ?? null;

  if (!post) return null;

  const metaByPost = new Map<string, VacancyMeta>();

  metasTable?.data.forEach((meta) => {
    if (meta?.post_id !== post.ID || !meta.meta_key) return;

    const current: VacancyMeta = metaByPost.get(meta.post_id) ?? {};
    current[meta.meta_key as keyof VacancyMeta] =
      meta.meta_value ?? undefined;
    metaByPost.set(meta.post_id, current);
  });

  const meta = metaByPost.get(post.ID) ?? {};

  return {
    id: post.ID,
    title: post.post_title ?? "Vaga",
    slug: post.post_name ?? "",
    city: meta.cidade ?? undefined,
    state: meta.estado ?? undefined,
    period: meta.periodo ?? undefined,
    workload: meta.carga_horaria ?? undefined,
    shelter: meta.abrigo ?? undefined,
    skills: meta.habilidades_e_funcoes ?? undefined,
    volunteerProfile: meta.perfil_dos_voluntarios ?? undefined,
    quantity: meta.quantidade ?? undefined,
    description: cleanContent(post.post_content) ?? cleanContent(meta.descricao),
  };
}
