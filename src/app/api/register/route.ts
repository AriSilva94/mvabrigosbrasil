import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

type RegisterRequestBody = {
  email?: string;
  password?: string;
  registerType?: string;
};

export async function POST(request: Request) {
  try {
    const { email, password, registerType } = (await request.json()) as RegisterRequestBody;

    const trimmedEmail = (email ?? "").trim();
    const trimmedPassword = (password ?? "").trim();

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

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      password: trimmedPassword,
      email_confirm: true, // Não usamos confirmação de e-mail neste projeto.
      user_metadata: { registerType },
    });

    if (error) {
      const status = error.status ?? 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ ok: true, userId: data.user?.id ?? null });
  } catch (error) {
    console.error("register: erro inesperado", error);
    return NextResponse.json(
      { error: "Erro ao processar cadastro" },
      { status: 500 },
    );
  }
}
