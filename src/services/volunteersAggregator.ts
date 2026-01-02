import type { SupabaseClientType } from "@/lib/supabase/types";
import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";
import {
  fetchVolunteerCardsFromNew,
  fetchVolunteerProfileBySlugFromNew,
} from "@/repositories/newVolunteersRepository";

/**
 * Supabase-only volunteer cards (WordPress legacy removed).
 */
export async function fetchVolunteerCardsFromSupabase(
  supabase: SupabaseClientType
): Promise<{ volunteers: VolunteerCard[]; error: Error | null }> {
  const { volunteers, error } = await fetchVolunteerCardsFromNew(supabase);

  if (error) {
    console.error(
      "volunteersAggregator.fetchVolunteerCardsFromSupabase - supabase error:",
      error
    );
  }

  return { volunteers: volunteers ?? [], error };
}

/**
 * Supabase-only volunteer profile lookup (WordPress legacy removed).
 */
export async function fetchVolunteerProfileBySlugFromSupabase(
  supabase: SupabaseClientType,
  slug: string
): Promise<{ profile: VolunteerProfile | null; error: Error | null }> {
  const { profile, error } = await fetchVolunteerProfileBySlugFromNew(supabase, slug);

  if (error) {
    console.error(
      "volunteersAggregator.fetchVolunteerProfileBySlugFromSupabase - supabase error:",
      error
    );
  }

  return { profile: profile ?? null, error };
}
