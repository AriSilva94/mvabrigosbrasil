import type { SupabaseClientType } from "@/lib/supabase/types";
import { findProfileById } from "./repositories/profileRepository";
import { findLegacyUserByEmail } from "./repositories/wpUsersLegacyRepository";
import { findPostTypeByAuthorId } from "./repositories/wpPostsRepository";

type ResolvePostTypeParams = {
  supabaseUserId?: string | null;
  email?: string | null;
};

export async function resolvePostTypeForUser(
  supabaseAdmin: SupabaseClientType,
  { supabaseUserId, email }: ResolvePostTypeParams,
): Promise<string | null> {
  let lookupEmail = email ?? null;
  let postAuthorId: number | null = null;

  if (supabaseUserId) {
    const { profile } = await findProfileById(supabaseAdmin, supabaseUserId);
    postAuthorId = profile?.wp_user_id ?? null;
    lookupEmail = profile?.email ?? lookupEmail;
  }

  if (!postAuthorId && lookupEmail) {
    const { legacyUser } = await findLegacyUserByEmail(supabaseAdmin, lookupEmail);
    postAuthorId = legacyUser?.id ?? null;
  }

  const { postType } = await findPostTypeByAuthorId(supabaseAdmin, postAuthorId);
  return postType ?? null;
}
