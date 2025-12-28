import type { SupabaseClientType } from "@/lib/supabase/types";

export interface RawUserRecord {
  id: number;
  user_pass: string | null;
  user_email: string | null;
  user_login: string | null;
  display_name: string | null;
}

export async function findRawUserByEmail(
  supabaseAdmin: SupabaseClientType,
  email: string,
): Promise<{ rawUser: RawUserRecord | null; error: Error | null }> {
  const { data, error } = await supabaseAdmin
    .from("wp_users_raw")
    .select("id, user_pass, user_email, user_login, display_name")
    .ilike("user_email", email)
    .maybeSingle();

  if (error) {
    console.error("wpUsersRawRepository.findRawUserByEmail", error);
    return { rawUser: null, error };
  }

  return { rawUser: (data as RawUserRecord | null) ?? null, error: null };
}
