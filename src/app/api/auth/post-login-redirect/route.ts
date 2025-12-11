import { NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    let userId: string | null = null;

    if (bearerToken) {
      const { data, error } = await supabaseAdmin.auth.getUser(bearerToken);
      if (error) {
        console.error("post-login-redirect: erro ao ler token", error);
      }
      userId = data.user?.id ?? null;
    }

    if (!userId) {
      const supabase = await getServerSupabaseClient({ readOnly: true });
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }

      userId = authData.user.id;
    }

    const { data, error } = await supabaseAdmin
      .from("shelters")
      .select("id")
      .eq("profile_id", userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      const isUnknownColumn = error.code === "42703";
      if (!isUnknownColumn) {
        console.error("post-login-redirect: erro ao consultar shelters", error);
      }
      // Se a coluna ainda não existir, assume que não há cadastro para evitar 500.
      if (isUnknownColumn) {
        return NextResponse.json({
          hasShelter: false,
          redirectTo: ROUTES.profile,
          warning: "Campo profile_id ausente em shelters; assumindo sem cadastro.",
        });
      }

      return NextResponse.json({ error: "Erro ao consultar cadastro" }, { status: 500 });
    }

    const hasShelter = Boolean(data);
    const redirectTo = hasShelter ? ROUTES.panel : ROUTES.profile;

    return NextResponse.json({ hasShelter, redirectTo });
  } catch (error) {
    console.error("post-login-redirect: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao decidir redirecionamento" }, { status: 500 });
  }
}
