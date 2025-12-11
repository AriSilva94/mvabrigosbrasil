"use client";

import wpPostmeta from "@/data/wp/wp_postmeta.json";
import wpPostsVoluntario from "@/data/wp/wp_posts_voluntario.json";
import type { VolunteerCard } from "@/types/volunteer.types";
import type { WpPost, WpPostMeta, WpTable } from "@/types/database.types";
import { VOLUNTEER_META_KEYS, type VolunteerMetaKey } from "@/constants/volunteerMetaKeys";

type VolunteerMeta = {
  cidade?: string;
  estado?: string;
  genero?: string;
  disponibilidade?: string;
};

function isTable<T>(value: unknown, name: string): value is WpTable<T> {
  const candidate = value as Partial<WpTable<T>>;
  return (
    candidate?.type === "table" &&
    candidate?.name === name &&
    Array.isArray(candidate?.data)
  );
}

function isVolunteerMetaKey(key: string): key is VolunteerMetaKey {
  return Object.values(VOLUNTEER_META_KEYS).includes(key as VolunteerMetaKey);
}

function buildVolunteerCards(): VolunteerCard[] {
  const postsTable = (wpPostsVoluntario as unknown[]).find((item) =>
    isTable<WpPost>(item, "wp_posts")
  ) as WpTable<WpPost> | undefined;

  const metasTable = (wpPostmeta as unknown[]).find((item) =>
    isTable<WpPostMeta>(item, "wp_postmeta")
  ) as WpTable<WpPostMeta> | undefined;

  if (!postsTable?.data || !metasTable?.data) return [];

  const metaByPost = new Map<string, VolunteerMeta>();

  metasTable.data.forEach((meta) => {
    if (!meta?.post_id || !meta?.meta_key) return;
    if (!isVolunteerMetaKey(meta.meta_key)) return;

    const current: VolunteerMeta = metaByPost.get(meta.post_id) ?? {};
    current[meta.meta_key] = meta.meta_value ?? undefined;
    metaByPost.set(meta.post_id, current);
  });

  const posts = postsTable.data
    .filter(
      (post) =>
        post?.post_type === "voluntario" && post?.post_status === "publish"
    )
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
      const gender = meta.genero?.trim();
      const availability = meta.disponibilidade?.trim();

      return {
        id: post.ID,
        name: post.post_title ?? "Voluntário",
        slug: post.post_name ?? "",
        city,
        state,
        location:
          city && state ? `${city} - ${state}` : city || state || undefined,
        gender,
        availability,
      };
    })
    .filter((volunteer) => volunteer.slug !== "");
}

export function useVolunteerCards(): VolunteerCard[] {
  return buildVolunteerCards();
}
