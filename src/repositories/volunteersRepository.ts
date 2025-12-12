import type { SupabaseClientType } from "@/lib/supabase/types";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";
import { VOLUNTEER_META_KEYS, type VolunteerMetaKey } from "@/constants/volunteerMetaKeys";

type VolunteerCardMeta = {
  [VOLUNTEER_META_KEYS.CITY]?: string;
  [VOLUNTEER_META_KEYS.STATE]?: string;
  [VOLUNTEER_META_KEYS.GENDER]?: string;
  [VOLUNTEER_META_KEYS.AVAILABILITY]?: string;
};

type VolunteerProfileMeta = VolunteerCardMeta & {
  [VOLUNTEER_META_KEYS.PROFESSION]?: string;
  [VOLUNTEER_META_KEYS.SCHOOLING]?: string;
  [VOLUNTEER_META_KEYS.EXPERIENCE]?: string;
  [VOLUNTEER_META_KEYS.SKILLS]?: string;
  [VOLUNTEER_META_KEYS.PERIOD]?: string;
  [VOLUNTEER_META_KEYS.NOTES]?: string;
};

type WpPost = {
  post_id: number | null;
  meta_key: string | null;
  meta_value: string | null;
};

function isVolunteerMetaKey(key: string): key is VolunteerMetaKey {
  return Object.values(VOLUNTEER_META_KEYS).includes(key as VolunteerMetaKey);
}

function buildMetaMap<T extends Record<string, string | undefined>>(
  metas: WpPostMeta[],
  postId: number
): T {
  const metaMap = {} as T;

  metas.forEach((meta) => {
    if (!meta.post_id || meta.post_id !== postId || !meta.meta_key) return;
    if (!isVolunteerMetaKey(meta.meta_key)) return;

    metaMap[meta.meta_key as keyof T] = (meta.meta_value ?? undefined) as T[keyof T];
  });

  return metaMap;
}

/**
 * Busca todos os voluntários publicados com metadados básicos para exibição em cards
 */
export async function fetchVolunteerCards(
  supabase: SupabaseClientType
): Promise<{ volunteers: VolunteerCard[]; error: Error | null }> {
  try {
    // Buscar posts do tipo "voluntario" publicados
    const { data: posts, error: postsError } = await supabase
      .from("wp_posts_raw")
      .select("id, post_title, post_name, post_date")
      .eq("post_type", REGISTER_TYPES.volunteer)
      .eq("post_status", "publish")
      .not("post_name", "is", null)
      .order("post_date", { ascending: false });

    if (postsError) {
      console.error("volunteersRepository.fetchVolunteerCards - posts error:", postsError);
      return { volunteers: [], error: postsError };
    }

    if (!posts || posts.length === 0) {
      return { volunteers: [], error: null };
    }

    const postIds = posts.map((p) => p.id);

    // Buscar metadados dos posts
    const metaKeys = [
      VOLUNTEER_META_KEYS.CITY,
      VOLUNTEER_META_KEYS.STATE,
      VOLUNTEER_META_KEYS.GENDER,
      VOLUNTEER_META_KEYS.AVAILABILITY,
    ];

    const { data: metas, error: metasError } = await supabase
      .from("wp_postmeta_raw")
      .select("post_id, meta_key, meta_value")
      .in("post_id", postIds)
      .in("meta_key", metaKeys);

    if (metasError) {
      console.error("volunteersRepository.fetchVolunteerCards - metas error:", metasError);
      // Continua sem metadados em caso de erro
    }

    // Mapear posts com metadados
    const volunteers: VolunteerCard[] = posts.map((post) => {
      const meta = buildMetaMap<VolunteerCardMeta>(metas ?? [], post.id);
      const city = meta[VOLUNTEER_META_KEYS.CITY]?.trim();
      const state = meta[VOLUNTEER_META_KEYS.STATE]?.trim();
      const gender = meta[VOLUNTEER_META_KEYS.GENDER]?.trim();
      const availability = meta[VOLUNTEER_META_KEYS.AVAILABILITY]?.trim();

      return {
        id: String(post.id),
        name: post.post_title ?? "Voluntário",
        slug: post.post_name ?? "",
        city,
        state,
        location: city && state ? `${city} - ${state}` : city || state || undefined,
        gender,
        availability,
      };
    });

    return { volunteers, error: null };
  } catch (error) {
    console.error("volunteersRepository.fetchVolunteerCards - unexpected error:", error);
    return { volunteers: [], error: error as Error };
  }
}

/**
 * Busca um voluntário específico por slug com todos os metadados para perfil completo
 */
export async function fetchVolunteerProfileBySlug(
  supabase: SupabaseClientType,
  slug: string
): Promise<{ profile: VolunteerProfile | null; error: Error | null }> {
  try {
    // Buscar post por slug
    const { data: post, error: postError } = await supabase
      .from("wp_posts_raw")
      .select("id, post_title, post_name")
      .eq("post_type", REGISTER_TYPES.volunteer)
      .eq("post_status", "publish")
      .eq("post_name", slug)
      .maybeSingle();

    if (postError) {
      console.error("volunteersRepository.fetchVolunteerProfileBySlug - post error:", postError);
      return { profile: null, error: postError };
    }

    if (!post) {
      return { profile: null, error: null };
    }

    // Buscar metadados do post
    const metaKeys = [
      VOLUNTEER_META_KEYS.CITY,
      VOLUNTEER_META_KEYS.STATE,
      VOLUNTEER_META_KEYS.PROFESSION,
      VOLUNTEER_META_KEYS.SCHOOLING,
      VOLUNTEER_META_KEYS.EXPERIENCE,
      VOLUNTEER_META_KEYS.AVAILABILITY,
      VOLUNTEER_META_KEYS.SKILLS,
      VOLUNTEER_META_KEYS.PERIOD,
      VOLUNTEER_META_KEYS.NOTES,
    ];

    const { data: metas, error: metasError } = await supabase
      .from("wp_postmeta_raw")
      .select("post_id, meta_key, meta_value")
      .eq("post_id", post.id)
      .in("meta_key", metaKeys);

    if (metasError) {
      console.error("volunteersRepository.fetchVolunteerProfileBySlug - metas error:", metasError);
      // Continua sem metadados em caso de erro
    }

    const meta = buildMetaMap<VolunteerProfileMeta>(metas ?? [], post.id);

    const profile: VolunteerProfile = {
      id: String(post.id),
      name: post.post_title ?? "Voluntário",
      slug: post.post_name ?? "",
      city: meta[VOLUNTEER_META_KEYS.CITY]?.trim() ?? undefined,
      state: meta[VOLUNTEER_META_KEYS.STATE]?.trim() ?? undefined,
      profession: meta[VOLUNTEER_META_KEYS.PROFESSION]?.trim() ?? undefined,
      schooling: meta[VOLUNTEER_META_KEYS.SCHOOLING]?.trim() ?? undefined,
      experience: meta[VOLUNTEER_META_KEYS.EXPERIENCE]?.trim() ?? undefined,
      availability: meta[VOLUNTEER_META_KEYS.AVAILABILITY]?.trim() ?? undefined,
      skills: meta[VOLUNTEER_META_KEYS.SKILLS]?.trim() ?? undefined,
      period: meta[VOLUNTEER_META_KEYS.PERIOD]?.trim() ?? undefined,
      notes: meta[VOLUNTEER_META_KEYS.NOTES]?.trim() ?? undefined,
    };

    return { profile, error: null };
  } catch (error) {
    console.error("volunteersRepository.fetchVolunteerProfileBySlug - unexpected error:", error);
    return { profile: null, error: error as Error };
  }
}
