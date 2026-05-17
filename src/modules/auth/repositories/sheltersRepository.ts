import type { SupabaseClientType } from "@/lib/supabase/types";

export async function linkShelterToProfileByWpUserId(
  supabaseAdmin: SupabaseClientType,
  wpUserId: number,
  profileId: string,
): Promise<{ linked: boolean; error: Error | null }> {
  const { data: wpPost, error: wpPostError } = await supabaseAdmin
    .from("wp_posts_raw")
    .select("id")
    .eq("post_type", "abrigo")
    .eq("post_author", wpUserId)
    .limit(1)
    .maybeSingle();

  if (wpPostError) {
    return { linked: false, error: wpPostError };
  }

  if (!wpPost) {
    return { linked: false, error: null };
  }

  const { error: updateError } = await supabaseAdmin
    .from("shelters")
    .update({ profile_id: profileId })
    .eq("wp_post_id", wpPost.id)
    .is("profile_id", null);

  if (updateError) {
    return { linked: false, error: updateError };
  }

  return { linked: true, error: null };
}
