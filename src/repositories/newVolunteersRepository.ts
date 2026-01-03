import type { SupabaseClientType } from "@/lib/supabase/types";
import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";

const ID_SUFFIX_REGEX = /^[0-9a-f]{8}$/i;

function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getIdSuffix(id: string): string {
  return id.replace(/-/g, "").slice(0, 8) || "novo";
}

function ensureSlugHasIdSuffix(slug: string, id: string): string {
  const idSuffix = getIdSuffix(id);
  const cleanedSlug = slug.replace(/-+$/, "");
  const parts = cleanedSlug.split("-");
  const lastSegment = parts.at(-1) ?? "";

  if (lastSegment.toLowerCase() === idSuffix.toLowerCase()) {
    return cleanedSlug;
  }

  if (ID_SUFFIX_REGEX.test(lastSegment)) {
    parts.pop();
    return `${parts.join("-")}-${idSuffix}`;
  }

  return `${cleanedSlug}-${idSuffix}`;
}

function stripIdSuffix(slug: string): string {
  const parts = slug.split("-");
  if (parts.length <= 1) return slug;

  const lastSegment = parts.at(-1) ?? "";
  if (!ID_SUFFIX_REGEX.test(lastSegment)) return slug;

  parts.pop();
  return parts.join("-");
}

export function generateVolunteerSlug(name: string, id: string): string {
  const base = slugifyName(name || "voluntario");
  return ensureSlugHasIdSuffix(base, id);
}

type VolunteerRow = {
  id: string;
  name: string;
  cidade: string | null;
  estado: string | null;
  slug?: string | null;
  genero: string | null;
  disponibilidade: string | null;
  wp_post_id: number | null;
  created_at: string | null;
  profissao?: string | null;
  escolaridade?: string | null;
  experiencia?: string | null;
  atuacao?: string | null;
  periodo?: string | null;
  descricao?: string | null;
  comentarios?: string | null;
};

export async function fetchVolunteerCardsFromNew(
  supabase: SupabaseClientType
): Promise<{ volunteers: VolunteerCard[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("volunteers")
      .select(
        "id, name, slug, cidade, estado, genero, disponibilidade, wp_post_id, created_at"
      )
      .eq("accept_terms", true)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("newVolunteersRepository.fetchVolunteerCardsFromNew - error:", error);
      return { volunteers: [], error };
    }

    const volunteers: VolunteerCard[] = (data ?? []).map((volunteer) => {
      const idSuffix = getIdSuffix(volunteer.id);
      const city = volunteer.cidade?.trim();
      const state = volunteer.estado?.trim();
      // Usar slug do banco ou gerar fallback se não existir (migração em andamento)
      const slugFromDb = typeof volunteer.slug === 'string' ? volunteer.slug : null;
      const baseSlug = slugFromDb || slugifyName(volunteer.name || "voluntario");
      const slug = ensureSlugHasIdSuffix(baseSlug, volunteer.id);

      return {
        id: volunteer.id,
        name: volunteer.name ?? "Voluntário",
        slug: slug || `${baseSlug}-${idSuffix}`,
        createdAt: volunteer.created_at ?? undefined,
        city,
        state,
        location: city && state ? `${city} - ${state}` : city || state || undefined,
        gender: volunteer.genero ?? undefined,
        availability: volunteer.disponibilidade ?? undefined,
        wpPostId: volunteer.wp_post_id ? String(volunteer.wp_post_id) : undefined,
        source: "new",
      };
    });

    return { volunteers, error: null };
  } catch (error) {
    console.error("newVolunteersRepository.fetchVolunteerCardsFromNew - unexpected error:", error);
    return { volunteers: [], error: error as Error };
  }
}

export async function fetchVolunteerProfileBySlugFromNew(
  supabase: SupabaseClientType,
  slug: string
): Promise<{ profile: VolunteerProfile | null; error: Error | null }> {
  try {
    const selectColumns =
      "id, name, slug, cidade, estado, profissao, escolaridade, experiencia, disponibilidade, atuacao, periodo, descricao, comentarios, genero, wp_post_id, created_at";

    const lookupSlug = slug?.trim();
    const baseSlug = lookupSlug ? stripIdSuffix(lookupSlug) : "";

    const firstAttempt = await supabase
      .from("volunteers")
      .select(selectColumns)
      .eq("slug", lookupSlug)
      .eq("accept_terms", true)
      .eq("is_public", true)
      .maybeSingle();

    let row = (firstAttempt.data as VolunteerRow | null) ?? null;
    let error: Error | null = firstAttempt.error;

    if (!row && baseSlug && baseSlug !== lookupSlug) {
      const secondAttempt = await supabase
        .from("volunteers")
        .select(selectColumns)
        .eq("slug", baseSlug)
        .eq("accept_terms", true)
        .eq("is_public", true)
        .maybeSingle();

      row = (secondAttempt.data as VolunteerRow | null) ?? null;
      error = error || secondAttempt.error;
    }

    if (error) {
      console.error("newVolunteersRepository.fetchVolunteerProfileBySlugFromNew - error:", error);
      return { profile: null, error };
    }

    if (!row) {
      return { profile: null, error: null };
    }

    const slugFromDb = typeof row.slug === "string" ? row.slug : null;
    const slugWithId = ensureSlugHasIdSuffix(
      slugFromDb || slugifyName(row.name || "voluntario"),
      row.id
    );
    const profile: VolunteerProfile = {
      id: row.id,
      name: row.name ?? "Voluntário",
      slug: slugWithId,
      createdAt: row.created_at ?? undefined,
      city: row.cidade ?? undefined,
      state: row.estado ?? undefined,
      profession: row.profissao ?? undefined,
      schooling: row.escolaridade ?? undefined,
      experience: row.experiencia ?? undefined,
      availability: row.disponibilidade ?? undefined,
      skills: row.descricao ?? row.atuacao ?? undefined,
      period: row.periodo ?? undefined,
      notes: row.comentarios ?? undefined,
      wpPostId: row.wp_post_id ? String(row.wp_post_id) : undefined,
      source: "new",
    };

    return { profile, error: null };
  } catch (error) {
    console.error("newVolunteersRepository.fetchVolunteerProfileBySlugFromNew - unexpected error:", error);
    return { profile: null, error: error as Error };
  }
}
