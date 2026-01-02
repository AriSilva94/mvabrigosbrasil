import type { SupabaseClientType } from "@/lib/supabase/types";

export async function findPostTypeByAuthorId(
  supabaseAdmin: SupabaseClientType,
  postAuthorId: number | null,
): Promise<{ postType: string | null; error: Error | null }> {
  if (!postAuthorId) return { postType: null, error: null };

  const { data, error } = await supabaseAdmin
    .from("wp_posts_raw")
    .select("post_type")
    .eq("post_author", postAuthorId)
    .in("post_type", ["abrigo", "voluntario"])
    .eq("post_status", "publish")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("wpPostsRepository.findPostTypeByAuthorId", { postAuthorId, error });
    return { postType: null, error };
  }

  return { postType: data?.post_type ?? null, error: null };
}
