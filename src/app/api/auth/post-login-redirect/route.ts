import { NextResponse } from "next/server";

import { REGISTER_TYPES } from "@/constants/registerTypes";
import { ROUTES } from "@/constants/routes";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";

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

    let userEmail: string | null = null;

    if (!userId) {
      const supabase = await getServerSupabaseClient({ readOnly: true });
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }

      userId = authData.user.id;
      userEmail = authData.user.email ?? null;
    } else {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      userEmail = userData.user?.email ?? null;
    }

    // Admin sempre redireciona para o painel
    const registerType = await resolvePostTypeForUser(supabaseAdmin, {
      supabaseUserId: userId,
      email: userEmail,
    });

    if (registerType === REGISTER_TYPES.admin) {
      return NextResponse.json({
        hasShelter: false,
        hasVolunteer: false,
        hasProfile: true,
        redirectTo: ROUTES.panel,
      });
    }

    // Verifica se existe cadastro de abrigo
    const { data: shelterData, error: shelterError } = await supabaseAdmin
      .from("shelters")
      .select("id")
      .eq("profile_id", userId)
      .limit(1)
      .maybeSingle();

    if (shelterError) {
      const isUnknownColumn = shelterError.code === "42703";
      if (!isUnknownColumn) {
        console.error("post-login-redirect: erro ao consultar shelters", shelterError);
      }
    }

    const hasShelter = Boolean(shelterData);

    // Verifica se existe cadastro de voluntário
    const { data: volunteerData, error: volunteerError } = await supabaseAdmin
      .from("volunteers")
      .select("id")
      .eq("owner_profile_id", userId)
      .limit(1)
      .maybeSingle();

    if (volunteerError) {
      const isUnknownColumn = volunteerError.code === "42703";
      if (!isUnknownColumn) {
        console.error("post-login-redirect: erro ao consultar volunteers", volunteerError);
      }
    }

    const hasVolunteer = Boolean(volunteerData);

    // Se tem cadastro (abrigo ou voluntário), redireciona para o painel
    // Senão, redireciona para /meu-cadastro para completar o cadastro
    const hasProfile = hasShelter || hasVolunteer;
    const redirectTo = hasProfile ? ROUTES.panel : ROUTES.profile;

    return NextResponse.json({
      hasShelter,
      hasVolunteer,
      hasProfile,
      redirectTo
    });
  } catch (error) {
    console.error("post-login-redirect: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao decidir redirecionamento" }, { status: 500 });
  }
}
