import type { SupabaseClientType } from "@/lib/supabase/types";
import { normalizeRegisterType, type RegisterType } from "@/constants/registerTypes";
import { findProfileById } from "./repositories/profileRepository";
import { findLegacyUserByEmail } from "./repositories/wpUsersLegacyRepository";
import { findPostTypeByAuthorId } from "./repositories/wpPostsRepository";

type ResolvePostTypeParams = {
  supabaseUserId?: string | null;
  email?: string | null;
};

async function findRegisterTypeFromAuthMetadata(
  supabaseAdmin: SupabaseClientType,
  supabaseUserId?: string | null,
): Promise<RegisterType | null> {
  if (!supabaseUserId) return null;

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);
  if (error) {
    console.error("postTypeResolver.findRegisterTypeFromAuthMetadata", error);
    return null;
  }

  const metadataType = normalizeRegisterType(data.user?.user_metadata?.registerType);
  return metadataType;
}

export async function resolvePostTypeForUser(
  supabaseAdmin: SupabaseClientType,
  { supabaseUserId, email }: ResolvePostTypeParams,
): Promise<RegisterType | null> {
  const authRegisterType = await findRegisterTypeFromAuthMetadata(supabaseAdmin, supabaseUserId);
  if (authRegisterType) return authRegisterType;

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
  return normalizeRegisterType(postType);
}
