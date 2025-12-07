import { SupabaseClient } from '@supabase/supabase-js';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Tipagem mínima do schema usada no login/migração.
export type Database = {
  public: {
    Tables: {
      wp_users_legacy: {
        Row: {
          id: number;
          user_pass: string | null;
          user_email: string | null;
          user_login: string | null;
          display_name: string | null;
          migrated: boolean | null;
          migrated_at: string | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          id?: number;
          user_pass?: string | null;
          user_email?: string | null;
          user_login?: string | null;
          display_name?: string | null;
          migrated?: boolean | null;
          migrated_at?: string | null;
        };
        Update: {
          id?: number;
          user_pass?: string | null;
          user_email?: string | null;
          user_login?: string | null;
          display_name?: string | null;
          migrated?: boolean | null;
          migrated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          wp_user_id: number | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          wp_user_id?: number | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          wp_user_id?: number | null;
        };
        Relationships: [];
      };
      wp_posts_raw: {
        Row: {
          id: number;
          post_author: number;
          post_type: string | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          id?: number;
          post_author?: number;
          post_type?: string | null;
        };
        Update: {
          id?: number;
          post_author?: number;
          post_type?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type SupabaseClientType = SupabaseClient<Database>;
