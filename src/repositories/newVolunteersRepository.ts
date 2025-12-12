import type { SupabaseClientType } from "@/lib/supabase/types";
import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";

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

export function generateVolunteerSlug(name: string, id: string): string {
  const base = slugifyName(name || "voluntario");
  const idSuffix = id.replace(/-/g, "").slice(0, 8) || "novo";
  return `${base}-${idSuffix}`;
}

type VolunteerRow = {
  id: string;
  name: string;
  cidade: string | null;
  estado: string | null;
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
        "id, name, cidade, estado, genero, disponibilidade, wp_post_id, created_at"
      )
      .eq("accept_terms", true)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("newVolunteersRepository.fetchVolunteerCardsFromNew - error:", error);
      return { volunteers: [], error };
    }

    const volunteers: VolunteerCard[] = (data ?? []).map((volunteer) => {
      const city = volunteer.cidade?.trim();
      const state = volunteer.estado?.trim();
      const slug = generateVolunteerSlug(volunteer.name, volunteer.id);

      return {
        id: volunteer.id,
        name: volunteer.name ?? "Voluntário",
        slug,
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
    const { data, error } = await supabase
      .from("volunteers")
      .select(
        "id, name, cidade, estado, profissao, escolaridade, experiencia, disponibilidade, atuacao, periodo, descricao, comentarios, genero, wp_post_id, created_at"
      )
      .eq("accept_terms", true)
      .eq("is_public", true);

    if (error) {
      console.error("newVolunteersRepository.fetchVolunteerProfileBySlugFromNew - error:", error);
      return { profile: null, error };
    }

    const volunteers = (data ?? []) as VolunteerRow[];
    const match =
      volunteers.find(
        (volunteer) => generateVolunteerSlug(volunteer.name, volunteer.id) === slug
      ) ?? null;

    if (!match) {
      return { profile: null, error: null };
    }

    const profile: VolunteerProfile = {
      id: match.id,
      name: match.name ?? "Voluntário",
      slug: generateVolunteerSlug(match.name, match.id),
      createdAt: match.created_at ?? undefined,
      city: match.cidade ?? undefined,
      state: match.estado ?? undefined,
      profession: match.profissao ?? undefined,
      schooling: match.escolaridade ?? undefined,
      experience: match.experiencia ?? undefined,
      availability: match.disponibilidade ?? undefined,
      skills: match.descricao ?? match.atuacao ?? undefined,
      period: match.periodo ?? undefined,
      notes: match.comentarios ?? undefined,
      wpPostId: match.wp_post_id ? String(match.wp_post_id) : undefined,
      source: "new",
    };

    return { profile, error: null };
  } catch (error) {
    console.error("newVolunteersRepository.fetchVolunteerProfileBySlugFromNew - unexpected error:", error);
    return { profile: null, error: error as Error };
  }
}
