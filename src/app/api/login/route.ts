import { NextResponse } from "next/server";

import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { loginWithMigration } from "@/modules/auth/loginService";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as LoginRequestBody;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const supabase = await getServerSupabaseClient();
    const supabaseAdmin = getSupabaseAdminClient();

    const result = await loginWithMigration(supabase, supabaseAdmin, email, password);

    if (!result.ok) {
      return NextResponse.json({ error: result.errorMessage }, { status: result.status });
    }

    return NextResponse.json(
      {
        ok: true,
        migrated: result.migrated,
        postType: result.postType,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("login: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao processar login" }, { status: 500 });
  }
}
