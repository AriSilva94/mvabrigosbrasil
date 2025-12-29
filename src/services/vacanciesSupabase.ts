import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import type { VacancyProfile } from "@/types/vacancies.types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_PREFIX_REGEX = /^[0-9a-f]{8}$/i;

type VacancyRow = Database["public"]["Tables"]["vacancies"]["Row"];

type VacancyExtra = {
  post_content?: string;
  post_habilidades_e_funcoes?: string;
  post_perfil_dos_voluntarios?: string;
  post_periodo?: string;
  post_carga?: string;
  post_tipo_demanda?: string;
  post_area_atuacao?: string;
  post_quantidade?: number | string;
  cidade?: string;
  estado?: string;
  abrigo?: string;
};

function parseExtras(raw: string | null | undefined): VacancyExtra {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as VacancyExtra;
    return parsed ?? {};
  } catch {
    return { post_content: raw ?? undefined };
  }
}

function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildVacancySlug(title: string, id: string): string {
  const base = slugifyTitle(title || "vaga");
  const idPrefix = id.replace(/-/g, "").slice(0, 8) || "nova";
  return `${base}-${idPrefix}`;
}

export function extractVacancyIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  if (UUID_REGEX.test(slug)) return slug;
  const segments = slug.split("-");
  const maybeId = segments.at(-1) ?? "";
  if (UUID_PREFIX_REGEX.test(maybeId)) return maybeId;
  return null;
}

export function mapVacancyRow(row: VacancyRow): VacancyProfile {
  const extras = parseExtras(row.description);
  const title = row.title ?? "Vaga";
  const slug = buildVacancySlug(title, row.id);

  return {
    id: row.id,
    title,
    slug,
    city: extras.cidade,
    state: extras.estado,
    period: extras.post_periodo,
    workload: extras.post_carga,
    demand: extras.post_tipo_demanda,
    area: extras.post_area_atuacao,
    shelter: extras.abrigo,
    description: extras.post_content,
    skills: extras.post_habilidades_e_funcoes,
    volunteerProfile: extras.post_perfil_dos_voluntarios,
    quantity:
      typeof extras.post_quantidade === "number"
        ? String(extras.post_quantidade)
        : extras.post_quantidade,
  };
}

export async function fetchVacanciesByShelter(
  supabaseAdmin: SupabaseClient<Database>,
  shelterId: string
): Promise<{ vacancies: VacancyProfile[]; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from("vacancies")
    .select("id, shelter_id, title, description, status, created_at")
    .eq("shelter_id", shelterId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchVacanciesByShelter: erro ao consultar", error);
    return { vacancies: [], error: "Erro ao carregar vagas" };
  }

  const vacancies = (data ?? []).map(mapVacancyRow);
  return { vacancies };
}
