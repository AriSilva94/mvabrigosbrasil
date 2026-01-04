import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";

type RouteContext = {
  params: Promise<{ managerId: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { managerId } = await context.params;

    // Verificar se usuário é admin
    const supabase = await getServerSupabaseClient({ readOnly: true });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const registerType = await resolvePostTypeForUser(supabaseAdmin, {
      supabaseUserId: user.id,
      email: user.email ?? null,
    });

    if (registerType !== REGISTER_TYPES.admin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Pegar shelter_ids do body
    const body = await request.json();
    const { shelter_ids } = body as { shelter_ids: string[] };

    if (!Array.isArray(shelter_ids)) {
      return NextResponse.json({ error: "shelter_ids deve ser um array" }, { status: 400 });
    }

    console.log("Atualizando vínculos:", { managerId, shelter_ids });

    // Buscar profile do gerente para pegar wp_user_id
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("wp_user_id")
      .eq("id", managerId)
      .maybeSingle();

    if (!profile?.wp_user_id) {
      return NextResponse.json({ error: "Gerente não encontrado" }, { status: 404 });
    }

    console.log("Profile do gerente:", profile);

    // Buscar wp_post_id dos shelters selecionados
    const { data: shelters } = await supabaseAdmin
      .from("shelters")
      .select("id, wp_post_id")
      .in("id", shelter_ids);

    const wpPostIds = (shelters || []).map(s => s.wp_post_id).filter(Boolean) as number[];

    console.log("WP Post IDs dos shelters:", wpPostIds);

    // Deletar TODOS os vínculos existentes deste gerente
    const { error: deleteError } = await supabaseAdmin
      .from("team_memberships")
      .delete()
      .eq("member_wp_user_id", profile.wp_user_id)
      .eq("role", "manager");

    if (deleteError) {
      console.error("Erro ao deletar vínculos antigos:", deleteError);
      return NextResponse.json({ error: "Erro ao atualizar vínculos" }, { status: 500 });
    }

    console.log("Vínculos antigos deletados");

    // Criar novos vínculos para os shelters selecionados
    if (wpPostIds.length > 0) {
      const newMemberships: Array<{
        member_wp_user_id: number;
        abrigo_post_id: number;
        role: string;
        status: string;
      }> = wpPostIds.map(wpPostId => ({
        member_wp_user_id: profile.wp_user_id as number,
        abrigo_post_id: wpPostId,
        role: "manager",
        status: "active",
      }));

      const { error: insertError } = await supabaseAdmin
        .from("team_memberships")
        .insert(newMemberships);

      if (insertError) {
        console.error("Erro ao criar novos vínculos:", insertError);
        return NextResponse.json({ error: "Erro ao criar vínculos" }, { status: 500 });
      }

      console.log("Novos vínculos criados:", newMemberships.length);
    } else {
      console.log("Nenhum abrigo selecionado - todos os vínculos foram removidos");
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro ao atualizar vínculos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
