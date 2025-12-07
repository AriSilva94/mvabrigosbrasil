import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database, SupabaseClientType } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type GetServerSupabaseClientOptions = {
  readOnly?: boolean;
};

export async function getServerSupabaseClient(
  options?: GetServerSupabaseClientOptions,
): Promise<SupabaseClientType> {
  const cookieStore = await cookies();
  const readOnly = options?.readOnly ?? false;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        if (readOnly) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error("supabase setAll cookies failed", error);
          }
        });
      },
    },
  });
}
