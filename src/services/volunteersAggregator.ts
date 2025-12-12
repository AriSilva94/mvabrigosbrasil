import type { SupabaseClientType } from "@/lib/supabase/types";
import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";
import {
  fetchVolunteerCardsFromWp,
  fetchVolunteerProfileBySlugFromWp,
} from "@/repositories/volunteersRepository";
import {
  fetchVolunteerCardsFromNew,
  fetchVolunteerProfileBySlugFromNew,
} from "@/repositories/newVolunteersRepository";

function toTimestamp(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mergeVolunteerCards(
  newVolunteers: VolunteerCard[],
  wpVolunteers: VolunteerCard[]
): VolunteerCard[] {
  const seenWpPostIds = new Set<string>();
  const merged: VolunteerCard[] = [];

  newVolunteers.forEach((volunteer) => {
    if (volunteer.wpPostId) seenWpPostIds.add(volunteer.wpPostId);
    merged.push(volunteer);
  });

  wpVolunteers.forEach((volunteer) => {
    if (volunteer.wpPostId && seenWpPostIds.has(volunteer.wpPostId)) return;
    merged.push(volunteer);
  });

  return merged.sort((a, b) => {
    const diff = toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
    if (diff !== 0) return diff;
    return (b.id ?? "").localeCompare(a.id ?? "");
  });
}

export async function fetchCombinedVolunteerCards(
  supabase: SupabaseClientType
): Promise<{ volunteers: VolunteerCard[]; error: Error | null }> {
  const [wpResult, newResult] = await Promise.all([
    fetchVolunteerCardsFromWp(supabase),
    fetchVolunteerCardsFromNew(supabase),
  ]);

  if (wpResult.error) {
    console.error("volunteersAggregator.fetchCombinedVolunteerCards - wp error:", wpResult.error);
  }
  if (newResult.error) {
    console.error("volunteersAggregator.fetchCombinedVolunteerCards - new error:", newResult.error);
  }

  const volunteers = mergeVolunteerCards(
    newResult.volunteers ?? [],
    wpResult.volunteers ?? []
  );

  if (
    (!wpResult.volunteers || wpResult.volunteers.length === 0) &&
    (!newResult.volunteers || newResult.volunteers.length === 0)
  ) {
    return { volunteers: [], error: wpResult.error ?? newResult.error ?? null };
  }

  // Só retorna erro se ambas as fontes falharem; caso contrário entrega o que estiver disponível.
  const error =
    wpResult.error && newResult.error ? wpResult.error : null;

  return { volunteers, error };
}

export async function fetchVolunteerProfileBySlugCombined(
  supabase: SupabaseClientType,
  slug: string
): Promise<{ profile: VolunteerProfile | null; error: Error | null }> {
  const newResult = await fetchVolunteerProfileBySlugFromNew(supabase, slug);

  if (newResult.error) {
    console.error("volunteersAggregator.fetchVolunteerProfileBySlugCombined - new error:", newResult.error);
  }

  if (newResult.profile) {
    return { profile: newResult.profile, error: null };
  }

  const wpResult = await fetchVolunteerProfileBySlugFromWp(supabase, slug);

  if (wpResult.error) {
    console.error("volunteersAggregator.fetchVolunteerProfileBySlugCombined - wp error:", wpResult.error);
  }

  const error =
    (newResult.error && wpResult.error) ? wpResult.error ?? newResult.error ?? null : null;

  return { profile: wpResult.profile ?? null, error };
}
