import type { SupabaseClientType } from "@/lib/supabase/types";

export interface LegacyUserRecord {
  id: number;
  user_pass: string | null;
  user_email: string | null;
  user_login: string | null;
  display_name: string | null;
  migrated: boolean | null;
  migrated_at?: string | null;
}

export async function findLegacyUserByEmail(
  supabaseAdmin: SupabaseClientType,
  email: string,
): Promise<{ legacyUser: LegacyUserRecord | null; error: Error | null }> {
  const { data, error } = await supabaseAdmin
    .from("wp_users_legacy")
    .select("id, user_pass, user_email, user_login, display_name, migrated, migrated_at")
    .ilike("user_email", email)
    .maybeSingle();

  if (error) {
    console.error("wpUsersLegacyRepository.findLegacyUserByEmail", error);
    return { legacyUser: null, error };
  }

  return { legacyUser: (data as LegacyUserRecord | null) ?? null, error: null };
}

export async function markLegacyUserAsMigrated(
  supabaseAdmin: SupabaseClientType,
  legacyUserId: number,
): Promise<{ error: Error | null }> {
  const { error } = await supabaseAdmin
    .from("wp_users_legacy")
    .update({
      migrated: true,
      migrated_at: new Date().toISOString(),
    })
    .eq("id", legacyUserId);

  if (error) {
    console.error("wpUsersLegacyRepository.markLegacyUserAsMigrated", error);
  }

  return { error: error ?? null };
}

/**
 * Atualiza o hash de senha de um usuário legado
 * Usado para converter MD5 temporário para PHPass após login bem-sucedido
 */
export async function updateLegacyUserPassword(
  supabaseAdmin: SupabaseClientType,
  legacyUserId: number,
  newPasswordHash: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabaseAdmin
    .from("wp_users_legacy")
    .update({
      user_pass: newPasswordHash,
    })
    .eq("id", legacyUserId);

  if (error) {
    console.error("wpUsersLegacyRepository.updateLegacyUserPassword", error);
  }

  return { error: error ?? null };
}
