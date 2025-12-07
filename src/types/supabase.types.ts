import type { Database } from '@/lib/supabase/types';

// TODO: substituir pelos tipos gerados via Supabase CLI
export type SupabaseDatabase = Database;
export type SupabaseRow = Record<string, unknown>;
