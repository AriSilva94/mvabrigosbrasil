"use client";

import wpPostmeta from "@/data/wp/wp_postmeta.json";
import wpPostsVaga from "@/data/wp/wp_posts_vaga.json";
import type { WpPost, WpPostMeta, WpTable } from "@/types/database.types";
import type { VacancyCard } from "@/types/vacancy.types";

type LocationMeta = {
  cidade?: string;
  estado?: string;
};

type VacancyMeta = LocationMeta & {
  periodo?: string;
  carga_horaria?: string;
};

function isTable<T>(value: unknown, name: string): value is WpTable<T> {
  const candidate = value as Partial<WpTable<T>>;
  return (
    candidate?.type === "table" &&
    candidate?.name === name &&
    Array.isArray(candidate?.data)
  );
}

function isRelevantMeta(
  key: string
): key is keyof VacancyMeta {
  return (
    key === "cidade" ||
    key === "estado" ||
    key === "periodo" ||
    key === "carga_horaria"
  );
}

function buildVacancyCards(): VacancyCard[] {
  const postsTable = (wpPostsVaga as unknown[]).find((item) =>
    isTable<WpPost>(item, "wp_posts")
  ) as WpTable<WpPost> | undefined;

  const metasTable = (wpPostmeta as unknown[]).find((item) =>
    isTable<WpPostMeta>(item, "wp_postmeta")
  ) as WpTable<WpPostMeta> | undefined;

  if (!postsTable?.data || !metasTable?.data) return [];

  const metaByPost = new Map<string, VacancyMeta>();

  metasTable.data.forEach((meta) => {
    if (!meta?.post_id || !meta?.meta_key) return;
    if (!isRelevantMeta(meta.meta_key)) return;

    const current: VacancyMeta = metaByPost.get(meta.post_id) ?? {};
    current[meta.meta_key] = meta.meta_value ?? undefined;
    metaByPost.set(meta.post_id, current);
  });

  const posts = postsTable.data
    .filter((post) => post?.post_type === "vaga" && post?.post_status === "publish")
    .sort((a, b) => {
      const dateA = a?.post_date ? Date.parse(a.post_date) : 0;
      const dateB = b?.post_date ? Date.parse(b.post_date) : 0;
      if (dateA !== dateB) return dateB - dateA;
      return Number.parseInt(b.ID, 10) - Number.parseInt(a.ID, 10);
    });

  return posts
    .map((post) => {
      const meta = metaByPost.get(post.ID) ?? {};
      const city = meta.cidade?.trim();
      const state = meta.estado?.trim();

      return {
        id: post.ID,
        title: post.post_title ?? "Vaga",
        slug: post.post_name ?? "",
        period: meta.periodo ?? undefined,
        workload: meta.carga_horaria ?? undefined,
        location:
          city && state ? `${city} - ${state}` : city || state || undefined,
      };
    })
    .filter((vacancy) => vacancy.slug !== "");
}

export function useVacancyCards(): VacancyCard[] {
  return buildVacancyCards();
}
