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
          is_team_only: boolean | null;
          wp_user_id: number | null;
          origin: Database["public"]["Enums"]["user_origin"] | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          is_team_only?: boolean | null;
          wp_user_id?: number | null;
          origin?: Database["public"]["Enums"]["user_origin"] | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          is_team_only?: boolean | null;
          wp_user_id?: number | null;
          origin?: Database["public"]["Enums"]["user_origin"] | null;
        };
        Relationships: [];
      };
      shelters: {
        Row: {
          id: string;
          profile_id: string | null;
          shelter_type: string | null;
          cnpj: string | null;
          cpf: string | null;
          name: string | null;
          cep: string | null;
          street: string | null;
          number: number | null;
          district: string | null;
          state: string | null;
          city: string | null;
          website: string | null;
          foundation_date: string | null;
          species: string | null;
          additional_species: Json;
          temporary_agreement: string | null;
          initial_dogs: number | null;
          initial_cats: number | null;
          authorized_name: string | null;
          authorized_role: string | null;
          authorized_email: string | null;
          authorized_phone: string | null;
          active: boolean | null;
          accept_terms: boolean | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          shelter_type?: string | null;
          cnpj?: string | null;
          cpf?: string | null;
          name?: string | null;
          cep?: string | null;
          street?: string | null;
          number?: number | null;
          district?: string | null;
          state?: string | null;
          city?: string | null;
          website?: string | null;
          foundation_date?: string | null;
          species?: string | null;
          additional_species?: Json;
          temporary_agreement?: string | null;
          initial_dogs?: number | null;
          initial_cats?: number | null;
          authorized_name?: string | null;
          authorized_role?: string | null;
          authorized_email?: string | null;
          authorized_phone?: string | null;
          active?: boolean | null;
          accept_terms?: boolean | null;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          shelter_type?: string | null;
          cnpj?: string | null;
          cpf?: string | null;
          name?: string | null;
          cep?: string | null;
          street?: string | null;
          number?: number | null;
          district?: string | null;
          state?: string | null;
          city?: string | null;
          website?: string | null;
          foundation_date?: string | null;
          species?: string | null;
          additional_species?: Json;
          temporary_agreement?: string | null;
          initial_dogs?: number | null;
          initial_cats?: number | null;
          authorized_name?: string | null;
          authorized_role?: string | null;
          authorized_email?: string | null;
          authorized_phone?: string | null;
          active?: boolean | null;
          accept_terms?: boolean | null;
        };
        Relationships: [];
      };
      shelter_dynamics: {
        Row: {
          id: string;
          shelter_id: string;
          wp_post_id: number | null;
          kind: string;
          reference_date: string;
          entradas_de_animais: number | null;
          entradas_de_gatos: number | null;
          adocoes_caes: number | null;
          adocoes_gatos: number | null;
          devolucoes_caes: number | null;
          devolucoes_gatos: number | null;
          eutanasias_caes: number | null;
          eutanasias_gatos: number | null;
          mortes_naturais_caes: number | null;
          mortes_naturais_gatos: number | null;
          doencas_caes: number | null;
          doencas_gatos: number | null;
          retorno_de_caes: number | null;
          retorno_de_gatos: number | null;
          retorno_local_caes: number | null;
          retorno_local_gatos: number | null;
          dynamic_type: string;
          reference_period: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          shelter_id: string;
          wp_post_id?: number | null;
          kind: string;
          reference_date: string;
          entradas_de_animais?: number | null;
          entradas_de_gatos?: number | null;
          adocoes_caes?: number | null;
          adocoes_gatos?: number | null;
          devolucoes_caes?: number | null;
          devolucoes_gatos?: number | null;
          eutanasias_caes?: number | null;
          eutanasias_gatos?: number | null;
          mortes_naturais_caes?: number | null;
          mortes_naturais_gatos?: number | null;
          doencas_caes?: number | null;
          doencas_gatos?: number | null;
          retorno_de_caes?: number | null;
          retorno_de_gatos?: number | null;
          retorno_local_caes?: number | null;
          retorno_local_gatos?: number | null;
          dynamic_type?: string;
          reference_period?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          shelter_id?: string;
          wp_post_id?: number | null;
          kind?: string;
          reference_date?: string;
          entradas_de_animais?: number | null;
          entradas_de_gatos?: number | null;
          adocoes_caes?: number | null;
          adocoes_gatos?: number | null;
          devolucoes_caes?: number | null;
          devolucoes_gatos?: number | null;
          eutanasias_caes?: number | null;
          eutanasias_gatos?: number | null;
          mortes_naturais_caes?: number | null;
          mortes_naturais_gatos?: number | null;
          doencas_caes?: number | null;
          doencas_gatos?: number | null;
          retorno_de_caes?: number | null;
          retorno_de_gatos?: number | null;
          retorno_local_caes?: number | null;
          retorno_local_gatos?: number | null;
          dynamic_type?: string;
          reference_period?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      volunteers: {
        Row: {
          id: string;
          wp_post_id: number | null;
          owner_profile_id: string | null;
          name: string;
          telefone: string | null;
          cidade: string | null;
          estado: string | null;
          profissao: string | null;
          escolaridade: string | null;
          faixa_etaria: string | null;
          genero: string | null;
          experiencia: string | null;
          atuacao: string | null;
          disponibilidade: string | null;
          periodo: string | null;
          descricao: string | null;
          comentarios: string | null;
          is_public: boolean;
          accept_terms: boolean;
          created_at: string;
          updated_at: string;
          [key: string]: Json | undefined;
        };
        Insert: {
          id?: string;
          wp_post_id?: number | null;
          owner_profile_id?: string | null;
          name: string;
          telefone?: string | null;
          cidade?: string | null;
          estado?: string | null;
          profissao?: string | null;
          escolaridade?: string | null;
          faixa_etaria?: string | null;
          genero?: string | null;
          experiencia?: string | null;
          atuacao?: string | null;
          disponibilidade?: string | null;
          periodo?: string | null;
          descricao?: string | null;
          comentarios?: string | null;
          is_public?: boolean;
          accept_terms?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wp_post_id?: number | null;
          owner_profile_id?: string | null;
          name?: string;
          telefone?: string | null;
          cidade?: string | null;
          estado?: string | null;
          profissao?: string | null;
          escolaridade?: string | null;
          faixa_etaria?: string | null;
          genero?: string | null;
          experiencia?: string | null;
          atuacao?: string | null;
          disponibilidade?: string | null;
          periodo?: string | null;
          descricao?: string | null;
          comentarios?: string | null;
          is_public?: boolean;
          accept_terms?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "volunteers_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vacancies: {
        Row: {
          id: string;
          shelter_id: string | null;
          title: string | null;
          slug: string | null;
          description: string | null;
          status: string | null;
          wp_post_id: number | null;
          periodo: string | null;
          carga_horaria: string | null;
          cidade: string | null;
          estado: string | null;
          tipo_demanda: string | null;
          area_atuacao: string | null;
          quantidade: string | null;
          is_published: boolean | null;
          habilidades_e_funcoes: string | null;
          perfil_dos_voluntarios: string | null;
          created_at: string | null;
          updated_at: string | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          id?: string;
          shelter_id?: string | null;
          title?: string | null;
          slug?: string | null;
          description?: string | null;
          status?: string | null;
          wp_post_id?: number | null;
          periodo?: string | null;
          carga_horaria?: string | null;
          cidade?: string | null;
          estado?: string | null;
          tipo_demanda?: string | null;
          area_atuacao?: string | null;
          quantidade?: string | null;
          is_published?: boolean | null;
          habilidades_e_funcoes?: string | null;
          perfil_dos_voluntarios?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          shelter_id?: string | null;
          title?: string | null;
          slug?: string | null;
          description?: string | null;
          status?: string | null;
          wp_post_id?: number | null;
          periodo?: string | null;
          carga_horaria?: string | null;
          cidade?: string | null;
          estado?: string | null;
          tipo_demanda?: string | null;
          area_atuacao?: string | null;
          quantidade?: string | null;
          is_published?: boolean | null;
          habilidades_e_funcoes?: string | null;
          perfil_dos_voluntarios?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vacancies_shelter_id_fkey";
            columns: ["shelter_id"];
            referencedRelation: "shelters";
            referencedColumns: ["id"];
          },
        ];
      };
      shelter_history: {
        Row: {
          id: string;
          shelter_id: string;
          profile_id: string;
          operation: string;
          old_data: Json | null;
          new_data: Json | null;
          changed_fields: string[] | null;
          changed_at: string;
          changed_by: string | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          id?: string;
          shelter_id: string;
          profile_id: string;
          operation: string;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_fields?: string[] | null;
          changed_at?: string;
          changed_by?: string | null;
        };
        Update: {
          id?: string;
          shelter_id?: string;
          profile_id?: string;
          operation?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_fields?: string[] | null;
          changed_at?: string;
          changed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shelter_history_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shelter_history_shelter_id_fkey";
            columns: ["shelter_id"];
            referencedRelation: "shelters";
            referencedColumns: ["id"];
          },
        ];
      };
      wp_posts_raw: {
        Row: {
          id: number;
          post_author: number | null;
          post_date: string | null;
          post_date_gmt: string | null;
          post_content: string | null;
          post_title: string | null;
          post_excerpt: string | null;
          post_status: string | null;
          comment_status: string | null;
          ping_status: string | null;
          post_password: string | null;
          post_name: string | null;
          to_ping: string | null;
          pinged: string | null;
          post_modified: string | null;
          post_modified_gmt: string | null;
          post_content_filtered: string | null;
          post_parent: number | null;
          guid: string | null;
          menu_order: number | null;
          post_type: string | null;
          post_mime_type: string | null;
          comment_count: number | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          id?: number;
          post_author?: number | null;
          post_date?: string | null;
          post_date_gmt?: string | null;
          post_content?: string | null;
          post_title?: string | null;
          post_excerpt?: string | null;
          post_status?: string | null;
          comment_status?: string | null;
          ping_status?: string | null;
          post_password?: string | null;
          post_name?: string | null;
          to_ping?: string | null;
          pinged?: string | null;
          post_modified?: string | null;
          post_modified_gmt?: string | null;
          post_content_filtered?: string | null;
          post_parent?: number | null;
          guid?: string | null;
          menu_order?: number | null;
          post_type?: string | null;
          post_mime_type?: string | null;
          comment_count?: number | null;
        };
        Update: {
          id?: number;
          post_author?: number | null;
          post_date?: string | null;
          post_date_gmt?: string | null;
          post_content?: string | null;
          post_title?: string | null;
          post_excerpt?: string | null;
          post_status?: string | null;
          comment_status?: string | null;
          ping_status?: string | null;
          post_password?: string | null;
          post_name?: string | null;
          to_ping?: string | null;
          pinged?: string | null;
          post_modified?: string | null;
          post_modified_gmt?: string | null;
          post_content_filtered?: string | null;
          post_parent?: number | null;
          guid?: string | null;
          menu_order?: number | null;
          post_type?: string | null;
          post_mime_type?: string | null;
          comment_count?: number | null;
        };
        Relationships: [];
      };
      wp_postmeta_raw: {
        Row: {
          meta_id: number;
          post_id: number | null;
          meta_key: string | null;
          meta_value: string | null;
          [key: string]: Json | undefined;
        };
        Insert: {
          meta_id?: number;
          post_id?: number | null;
          meta_key?: string | null;
          meta_value?: string | null;
        };
        Update: {
          meta_id?: number;
          post_id?: number | null;
          meta_key?: string | null;
          meta_value?: string | null;
        };
        Relationships: [];
      };
      vacancy_applications: {
        Row: {
          id: string;
          vacancy_id: string;
          volunteer_id: string;
          status: string;
          applied_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vacancy_id: string;
          volunteer_id: string;
          status?: string;
          applied_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vacancy_id?: string;
          volunteer_id?: string;
          status?: string;
          applied_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vacancy_applications_vacancy_id_fkey";
            columns: ["vacancy_id"];
            referencedRelation: "vacancies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vacancy_applications_volunteer_id_fkey";
            columns: ["volunteer_id"];
            referencedRelation: "volunteers";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_origin: "wordpress_migrated" | "supabase_native" | "admin_created";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type SupabaseClientType = SupabaseClient<Database>;
