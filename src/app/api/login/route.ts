import { NextResponse } from "next/server";

import { verifyWordpressPassword } from "@/lib/auth/wordpressPassword";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import type { SupabaseClientType } from "@/lib/supabase/types";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

async function getPostTypeFromWpPosts(
  supabaseAdmin: SupabaseClientType,
  postAuthorId: number | null,
): Promise<string | null> {
  if (!postAuthorId) return null;

  const { data: wpPost } = await supabaseAdmin
    .from("wp_posts_raw")
    .select("post_type")
    .eq("post_author", postAuthorId)
    .maybeSingle();

  return wpPost?.post_type ?? null;
}

async function resolveUserPostType(
  supabaseAdmin: SupabaseClientType,
  params: { email: string; userId?: string },
): Promise<string | null> {
  const { email, userId } = params;

  let postAuthorId: number | null = null;

  if (userId) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("wp_user_id")
      .eq("id", userId)
      .maybeSingle();

    postAuthorId = profile?.wp_user_id ?? null;
  }

  if (!postAuthorId) {
    const { data: legacyUser } = await supabaseAdmin
      .from("wp_users_legacy")
      .select("id")
      .ilike("user_email", email)
      .maybeSingle();

    postAuthorId = legacyUser?.id ?? null;
  }

  return getPostTypeFromWpPosts(supabaseAdmin, postAuthorId);
}

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as LoginRequestBody;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const supabase = await getServerSupabaseClient();
    const supabaseAdmin = getSupabaseAdminClient();

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: trimmedPassword,
    });

    if (!signInError && signInData.session) {
      const postType = await resolveUserPostType(supabaseAdmin, {
        email: normalizedEmail,
        userId: signInData.user?.id,
      });

      return NextResponse.json({ ok: true, migrated: true, postType });
    }

    const { data: legacyUser, error: legacyError } = await supabaseAdmin
      .from("wp_users_legacy")
      .select("id, user_pass, user_email, user_login, display_name, migrated")
      .ilike("user_email", normalizedEmail)
      .single();

    if (legacyError || !legacyUser) {
      console.error("login: usuário legacy não encontrado ou erro na consulta", legacyError);
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const isValidPassword = await verifyWordpressPassword(trimmedPassword, legacyUser.user_pass);

    if (!isValidPassword) {
      console.error("login: senha não confere com hash legado", { userId: legacyUser.id });
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: trimmedPassword,
      email_confirm: true,
    });

    if (createUserError || !createdUser.user) {
      console.error("login: erro ao criar usuário no Auth", createUserError);
      return NextResponse.json({ error: "Erro ao migrar conta" }, { status: 500 });
    }

    const userId = createdUser.user.id;
    const postType = await getPostTypeFromWpPosts(supabaseAdmin, legacyUser.id);

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: legacyUser.user_email,
      full_name: legacyUser.display_name,
      wp_user_id: legacyUser.id,
    });

    if (profileError) {
      console.error("login: erro ao inserir profile", profileError);
    }

    const { error: markLegacyError } = await supabaseAdmin
      .from("wp_users_legacy")
      .update({
        migrated: true,
        migrated_at: new Date().toISOString(),
      })
      .eq("id", legacyUser.id);

    if (markLegacyError) {
      console.error("login: erro ao marcar usuário legacy como migrado", markLegacyError);
    }

    const { data: migratedSignIn, error: migratedSignInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: trimmedPassword,
    });

    if (migratedSignInError || !migratedSignIn.session) {
      console.error("login: erro ao autenticar após migração", migratedSignInError);
      return NextResponse.json({ error: "Erro ao autenticar após migração" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, migrated: false, postType });
  } catch (error) {
    console.error("login: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao processar login" }, { status: 500 });
  }
}
