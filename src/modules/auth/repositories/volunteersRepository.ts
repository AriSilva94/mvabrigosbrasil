import type { SupabaseClientType } from "@/lib/supabase/types";

/**
 * Links a migrated volunteer record to a newly created profile
 * Used during WordPress user migration to connect volunteer data to auth profile
 *
 * The logic:
 * 1. Find the WordPress post where post_author = wpUserId and post_type = 'voluntario'
 * 2. Update the volunteers table where wp_post_id matches that post's ID
 * 3. Set owner_profile_id to the new Supabase profile ID
 */
export async function linkVolunteerToProfileByWpUserId(
  supabaseAdmin: SupabaseClientType,
  wpUserId: number,
  profileId: string,
): Promise<{ linked: boolean; error: Error | null }> {
  // First, find the WordPress post authored by this user
  const { data: wpPost, error: wpPostError } = await supabaseAdmin
    .from("wp_posts_raw")
    .select("id")
    .eq("post_type", "voluntario")
    .eq("post_author", wpUserId)
    .limit(1)
    .maybeSingle();

  if (wpPostError) {
    console.error("volunteersRepository.linkVolunteerToProfileByWpUserId - wp_posts_raw error", wpPostError);
    return { linked: false, error: wpPostError };
  }

  if (!wpPost) {
    // No volunteer post found for this user - this is OK, not all users have volunteer profiles
    return { linked: false, error: null };
  }

  // Now update the volunteer record with owner_profile_id
  const { error: updateError } = await supabaseAdmin
    .from("volunteers")
    .update({ owner_profile_id: profileId })
    .eq("wp_post_id", wpPost.id)
    .is("owner_profile_id", null);

  if (updateError) {
    console.error("volunteersRepository.linkVolunteerToProfileByWpUserId - update error", updateError);
    return { linked: false, error: updateError };
  }

  console.log(`[Migration] Linked volunteer (wp_post_id: ${wpPost.id}) to profile (${profileId})`);
  return { linked: true, error: null };
}
