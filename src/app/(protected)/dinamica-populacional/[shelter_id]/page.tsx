import type { JSX } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import PageHeader from "@/components/layout/PageHeader";
import PopulationDynamicsContent from "../components/PopulationDynamicsContent";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";
import { getDynamicsUserSummary } from "@/modules/dynamics/getDynamicsUserSummary";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { REGISTER_TYPES } from "@/constants/registerTypes";

type PageParams = {
  shelter_id: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { shelter_id } = await params;

  return buildMetadata({
    title: "Dinâmica Populacional",
    description: "Visualização da dinâmica populacional do abrigo.",
    canonical: `/dinamica-populacional/${shelter_id}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<JSX.Element> {
  const { shelter_id } = await params;
  const shelterId = parseInt(shelter_id, 10);

  if (isNaN(shelterId)) {
    notFound();
  }

  const access = await enforceTeamAccess(`/dinamica-populacional/${shelter_id}`);

  // Apenas gerentes podem acessar esta rota
  if (access.registerType !== REGISTER_TYPES.manager) {
    notFound();
  }

  const supabaseAdmin = getSupabaseAdminClient();

  // Verificar se o gerente tem acesso a este abrigo
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("wp_user_id")
    .eq("id", access.userId)
    .maybeSingle();

  if (!profile?.wp_user_id) {
    notFound();
  }

  const { data: membership } = await supabaseAdmin
    .from("team_memberships")
    .select("id")
    .eq("member_wp_user_id", profile.wp_user_id)
    .eq("abrigo_post_id", shelterId)
    .eq("role", "manager")
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  // Buscar dados do abrigo
  console.log("🔍 [DYNAMICS MANAGER] Buscando dados para:", {
    shelterId,
    userId: access.userId,
    email: access.email,
  });

  const { summary: userSummary } = await getDynamicsUserSummary({
    userId: access.userId,
    fallbackEmail: access.email,
    creatorProfileId: access.creatorProfileId,
    isTeamOnly: false, // Gerente não é team_only
    shelterWpPostId: shelterId,
  });

  console.log("📊 [DYNAMICS MANAGER] Dados retornados:", userSummary);

  return (
    <main>
      <PageHeader
        title="Dinâmica Populacional"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Dinâmica Populacional" },
        ]}
      />

      <PopulationDynamicsContent
        userSummary={userSummary}
        isTeamOnly={true} // Modo somente-leitura para gerente
        shelterWpPostId={shelterId} // Passar ID do abrigo para buscar dados
      />
    </main>
  );
}
