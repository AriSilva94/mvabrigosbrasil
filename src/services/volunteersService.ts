import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { fetchVolunteerProfileBySlug } from "@/repositories/volunteersRepository";
import type { VolunteerProfile } from "@/types/volunteer.types";

export async function getVolunteerProfileBySlug(slug: string): Promise<VolunteerProfile | null> {
  const supabase = getSupabaseAdminClient();
  const { profile, error } = await fetchVolunteerProfileBySlug(supabase, slug);

  if (error) {
    console.error("volunteersService.getVolunteerProfileBySlug - error:", error);
    return null;
  }

  return profile;
}
