import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";

export async function GET() {
  try {
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

    // Buscar todos os usuários com registerType = "gerente" (com paginação)
    let allUsers: User[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (listError) {
        console.error("Erro ao listar usuários:", listError);
        return NextResponse.json({ error: "Erro ao buscar gerentes" }, { status: 500 });
      }

      allUsers = allUsers.concat(authUsers.users || []);
      hasMore = (authUsers.users || []).length === 1000;
      page++;
    }

    const authUsers = { users: allUsers };

    // Debug: Logar todos os tipos de registro encontrados
    console.log("Total de usuários:", authUsers.users?.length);

    // Procurar email específico
    const premierPet = authUsers.users?.find(u => u.email === 'institutopremierpet@premierpet.com.br');
    console.log("institutopremierpet@premierpet.com.br encontrado?", {
      found: !!premierPet,
      email: premierPet?.email,
      registerType: premierPet?.user_metadata?.registerType,
      metadata: premierPet?.user_metadata
    });

    console.log("Procurando por registerType:", REGISTER_TYPES.manager);

    // Filtrar apenas gerentes
    const managers = (authUsers.users || [])
      .filter(u => u.user_metadata?.registerType === REGISTER_TYPES.manager)
      .map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
      }));

    console.log("Gerentes encontrados:", managers.length);

    // Buscar profiles para pegar wp_user_id
    const managerIds = managers.map(m => m.id);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, wp_user_id, email")
      .in("id", managerIds);

    // Buscar team_memberships para ver abrigos vinculados
    const wpUserIds = (profiles || []).map(p => p.wp_user_id).filter(Boolean);
    const { data: memberships } = await supabaseAdmin
      .from("team_memberships")
      .select("member_wp_user_id, abrigo_post_id, status")
      .in("member_wp_user_id", wpUserIds)
      .eq("role", "manager");

    // Buscar nomes dos abrigos
    const abrigoIds = (memberships || []).map(m => m.abrigo_post_id).filter(Boolean);
    const { data: shelters } = await supabaseAdmin
      .from("shelters")
      .select("id, name, wp_post_id")
      .in("wp_post_id", abrigoIds);

    // Combinar dados
    const managersWithShelters = managers.map(manager => {
      const profile = profiles?.find(p => p.id === manager.id);
      const managerMemberships = memberships?.filter(
        m => m.member_wp_user_id === profile?.wp_user_id && m.status === "active"
      ) || [];

      const linkedShelters = managerMemberships
        .map(m => shelters?.find(s => s.wp_post_id === m.abrigo_post_id))
        .filter(Boolean);

      return {
        ...manager,
        wp_user_id: profile?.wp_user_id || null,
        shelters: linkedShelters.map(s => ({
          id: s!.id,
          name: s!.name,
          wp_post_id: s!.wp_post_id,
        })),
      };
    });

    return NextResponse.json({ managers: managersWithShelters });

  } catch (error) {
    console.error("Erro na API de gerentes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
