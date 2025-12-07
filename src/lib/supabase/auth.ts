import { getServerSupabaseClient } from './clientServer';

export async function getSessionFromSupabase() {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signOutFromSupabase() {
  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
