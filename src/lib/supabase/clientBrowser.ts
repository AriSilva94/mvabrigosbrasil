import { createBrowserClient } from '@supabase/ssr';

import type { Database, SupabaseClientType } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let browserClient: SupabaseClientType | undefined;

export function getBrowserSupabaseClient(): SupabaseClientType {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
