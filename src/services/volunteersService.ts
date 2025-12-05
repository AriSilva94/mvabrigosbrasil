import wpPostmeta from "@/data/wp/wp_postmeta.json";
import wpPostsVoluntario from "@/data/wp/wp_posts_voluntario.json";
import type { WpPost, WpPostMeta, WpTable } from "@/types/database.types";
import type { VolunteerProfile } from "@/types/volunteer.types";

type VolunteerMeta = {
  cidade?: string;
  estado?: string;
  profissao?: string;
  escolaridade?: string;
  experiencia?: string;
  disponibilidade?: string;
  descricao?: string;
  periodo?: string;
  comentarios?: string;
};

function isTable<T>(value: unknown, name: string): value is WpTable<T> {
  const candidate = value as Partial<WpTable<T>>;
  return (
    candidate?.type === "table" &&
    candidate?.name === name &&
    Array.isArray(candidate?.data)
  );
}

export function getVolunteerProfileBySlug(slug: string): VolunteerProfile | null {
  const postsTable = (wpPostsVoluntario as unknown[]).find((item) =>
    isTable<WpPost>(item, "wp_posts")
  ) as WpTable<WpPost> | undefined;

  const metasTable = (wpPostmeta as unknown[]).find((item) =>
    isTable<WpPostMeta>(item, "wp_postmeta")
  ) as WpTable<WpPostMeta> | undefined;

  if (!postsTable?.data) return null;

  const post =
    postsTable.data.find(
      (entry) =>
        entry?.post_type === "voluntario" &&
        entry?.post_status === "publish" &&
        entry?.post_name === slug
    ) ?? null;

  if (!post) return null;

  const metaByPost = new Map<string, VolunteerMeta>();

  metasTable?.data.forEach((meta) => {
    if (meta?.post_id !== post.ID || !meta.meta_key) return;

    const current: VolunteerMeta = metaByPost.get(meta.post_id) ?? {};
    current[meta.meta_key as keyof VolunteerMeta] =
      meta.meta_value ?? undefined;
    metaByPost.set(meta.post_id, current);
  });

  const meta = metaByPost.get(post.ID) ?? {};

  return {
    id: post.ID,
    name: post.post_title ?? "Voluntário",
    slug: post.post_name ?? "",
    city: meta.cidade ?? undefined,
    state: meta.estado ?? undefined,
    profession: meta.profissao ?? undefined,
    schooling: meta.escolaridade ?? undefined,
    experience: meta.experiencia ?? undefined,
    availability: meta.disponibilidade ?? undefined,
    skills: meta.descricao ?? undefined,
    period: meta.periodo ?? undefined,
    notes: meta.comentarios ?? undefined,
  };
}
