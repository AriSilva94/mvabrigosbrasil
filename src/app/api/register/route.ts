import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { REGISTER_TYPES } from "@/constants/registerTypes";

type RegisterRequestBody = {
  email?: string;
  password?: string;
  registerType?: string;
  teamOnly?: boolean;
};

export async function POST(request: Request) {
  try {
    const { email, password, registerType, teamOnly } =
      (await request.json()) as RegisterRequestBody;

    const trimmedEmail = (email ?? "").trim();
    const trimmedPassword = (password ?? "").trim();
    const isTeamOnly = Boolean(teamOnly);

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 },
      );
    }

    if (trimmedPassword.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 },
      );
    }

    let creatorUserId: string | null = null;

    if (isTeamOnly) {
      const supabase = await getServerSupabaseClient({ readOnly: true });
      const { data: session, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !session.user) {
        return NextResponse.json(
          { error: "É necessário estar logado para criar acessos da equipe." },
          { status: 401 },
        );
      }

      creatorUserId = session.user.id;
    }

    const normalizedRegisterType =
      registerType === REGISTER_TYPES.volunteer
        ? REGISTER_TYPES.volunteer
        : REGISTER_TYPES.shelter;

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      password: trimmedPassword,
      email_confirm: true, // Não usamos confirmação de e-mail neste projeto.
      user_metadata: {
        registerType: normalizedRegisterType,
        teamOnly: isTeamOnly,
        creator_profile_id: creatorUserId,
      },
    });

    if (error) {
      const status = error.status ?? 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    const userId = data.user?.id ?? null;

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário criado sem ID. Tente novamente." },
        { status: 500 },
      );
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: trimmedEmail,
        origin: isTeamOnly ? "admin_created" : "supabase_native",
        is_team_only: isTeamOnly,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("register: erro ao criar profile", profileError);
      return NextResponse.json(
        { error: "Erro ao criar perfil do usuário" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, userId });
  } catch (error) {
    console.error("register: erro inesperado", error);
    return NextResponse.json(
      { error: "Erro ao processar cadastro" },
      { status: 500 },
    );
  }
}
