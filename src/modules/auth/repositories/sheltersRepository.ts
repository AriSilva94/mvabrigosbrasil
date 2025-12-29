import type { SupabaseClientType } from "@/lib/supabase/types";

/**
 * Links a migrated shelter record to a newly created profile
 * Used during WordPress user migration to connect shelter data to auth profile
 *
 * The logic:
 * 1. Find the WordPress post where post_author = wpUserId and post_type = 'abrigo'
 * 2. Update the shelters table where wp_post_id matches that post's ID
 * 3. Set profile_id to the new Supabase profile ID
 */
export async function linkShelterToProfileByWpUserId(
  supabaseAdmin: SupabaseClientType,
  wpUserId: number,
  profileId: string,
): Promise<{ linked: boolean; error: Error | null }> {
  // First, find the WordPress post authored by this user
  const { data: wpPost, error: wpPostError } = await supabaseAdmin
    .from("wp_posts_raw")
    .select("id")
    .eq("post_type", "abrigo")
    .eq("post_author", wpUserId)
    .limit(1)
    .maybeSingle();

  if (wpPostError) {
    console.error("sheltersRepository.linkShelterToProfileByWpUserId - wp_posts_raw error", wpPostError);
    return { linked: false, error: wpPostError };
  }

  if (!wpPost) {
    // No shelter post found for this user - this is OK, not all users have shelter profiles
    return { linked: false, error: null };
  }

  // Now update the shelter record with profile_id
  const { error: updateError } = await supabaseAdmin
    .from("shelters")
    .update({ profile_id: profileId })
    .eq("wp_post_id", wpPost.id)
    .is("profile_id", null);

  if (updateError) {
    console.error("sheltersRepository.linkShelterToProfileByWpUserId - update error", updateError);
    return { linked: false, error: updateError };
  }

  console.log(`[Migration] Linked shelter (wp_post_id: ${wpPost.id}) to profile (${profileId})`);
  return { linked: true, error: null };
}
