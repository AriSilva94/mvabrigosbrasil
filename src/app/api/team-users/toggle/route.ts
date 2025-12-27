import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";

type ToggleRequestBody = {
  userId?: string;
  disable?: boolean;
};

export async function POST(request: Request): Promise<NextResponse<{ ok: true } | { error: string }>> {
  try {
    const supabase = await getServerSupabaseClient({ readOnly: true });
    const { data: session, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !session.user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { userId, disable } = (await request.json()) as ToggleRequestBody;
    const shouldDisable = Boolean(disable);

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: fetchedUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (fetchError || !fetchedUser?.user) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Usuário não encontrado." },
        { status: fetchError?.status ?? 404 },
      );
    }

    const targetUser = fetchedUser.user;

    if (
      targetUser.user_metadata?.teamOnly !== true ||
      targetUser.user_metadata?.creator_profile_id !== session.user.id
    ) {
      return NextResponse.json({ error: "Acesso negado para alterar este usuário." }, { status: 403 });
    }

    const currentMeta = targetUser.user_metadata ?? {};
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentMeta,
        teamDisabled: shouldDisable,
      },
    });

    if (updateError) {
      const status = updateError.status ?? 500;
      return NextResponse.json({ error: updateError.message }, { status });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("team-users/toggle: erro inesperado", error);
    return NextResponse.json(
      { error: "Não foi possível alterar o status do usuário." },
      { status: 500 },
    );
  }
}
