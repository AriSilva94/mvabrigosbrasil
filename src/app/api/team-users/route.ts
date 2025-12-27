import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";

type ApiErrorResponse = {
  error: string;
};

export async function GET(): Promise<NextResponse<{ users: unknown[] } | ApiErrorResponse>> {
  try {
    const supabase = await getServerSupabaseClient({ readOnly: true });
    const { data: session, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !session.user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      const status = error.status ?? 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    const creatorId = session.user.id;

    const users =
      data.users
        ?.filter(
          (user) =>
            user.user_metadata?.teamOnly === true &&
            user.user_metadata?.creator_profile_id === creatorId
        )
        .map((user) => ({
          id: user.id,
          email: user.email ?? null,
          createdAt: user.created_at ?? null,
          isDisabled: Boolean(user.user_metadata?.teamDisabled),
        })) ?? [];

    return NextResponse.json({ users });
  } catch (error) {
    console.error("team-users: erro inesperado", error);
    return NextResponse.json(
      { error: "Erro ao carregar usuários da equipe." },
      { status: 500 },
    );
  }
}
