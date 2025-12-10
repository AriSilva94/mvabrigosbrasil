import type { Database, SupabaseClientType } from "@/lib/supabase/types";

export interface ProfileRecord {
  id: string;
  email: string | null;
  full_name: string | null;
  wp_user_id: number | null;
  origin?: Database["public"]["Enums"]["user_origin"] | null;
}

type ProfileQueryResult = { profile: ProfileRecord | null; error: Error | null };

export async function findProfileById(
  supabaseAdmin: SupabaseClientType,
  supabaseUserId: string,
): Promise<ProfileQueryResult> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, wp_user_id, origin")
    .eq("id", supabaseUserId)
    .maybeSingle();

  if (error) {
    console.error("profileRepository.findProfileById", error);
    return { profile: null, error };
  }

  return { profile: (data as ProfileRecord | null) ?? null, error: null };
}

export async function findProfileByEmail(
  supabaseAdmin: SupabaseClientType,
  email: string,
): Promise<ProfileQueryResult> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, wp_user_id, origin")
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    console.error("profileRepository.findProfileByEmail", error);
    return { profile: null, error };
  }

  return { profile: (data as ProfileRecord | null) ?? null, error: null };
}

export async function insertProfileFromLegacy(
  supabaseAdmin: SupabaseClientType,
  profile: ProfileRecord,
): Promise<{ error: Error | null }> {
  const origin = profile.origin ?? "wordpress_migrated";

  const { error } = await supabaseAdmin.from("profiles").insert({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    wp_user_id: profile.wp_user_id,
    origin,
  });

  if (error) {
    console.error("profileRepository.insertProfileFromLegacy", error);
  }

  return { error: error ?? null };
}
