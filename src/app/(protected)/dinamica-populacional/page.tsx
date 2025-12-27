import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import PopulationDynamicsContent from "./components/PopulationDynamicsContent";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { findProfileById } from "@/modules/auth/repositories/profileRepository";
import { SHELTER_TYPE_OPTIONS } from "@/constants/shelterProfile";
import type { PopulationUserSummary } from "./types";

export const metadata = buildMetadata({
  title: "Registrar Dinâmica Populacional",
  description:
    "Formulário para registrar entradas, saídas e dinâmica populacional dos animais atendidos pelo abrigo.",
  canonical: "/dinamica-populacional",
});

export default async function Page(): Promise<JSX.Element> {
  const access = await enforceTeamAccess("/dinamica-populacional");

  const supabaseAdmin = getSupabaseAdminClient();

  const { profile } = await findProfileById(supabaseAdmin, access.userId);

  const { data: shelterRow, error: shelterError } = await supabaseAdmin
    .from("shelters")
    .select("id, name, shelter_type, initial_dogs, initial_cats")
    .eq("profile_id", access.userId)
    .limit(1)
    .maybeSingle();

  if (shelterError && shelterError.code !== "42703") {
    console.error(
      "dinamica-populacional: erro ao buscar abrigo do usuário",
      shelterError,
    );
  }

  const hasDogs = typeof shelterRow?.initial_dogs === "number";
  const hasCats = typeof shelterRow?.initial_cats === "number";
  const totalAnimals =
    hasDogs || hasCats
      ? (shelterRow?.initial_dogs ?? 0) + (shelterRow?.initial_cats ?? 0)
      : null;

  const shelterTypeLabel =
    SHELTER_TYPE_OPTIONS.find(
      (option) => option.value === shelterRow?.shelter_type,
    )?.label ?? null;

  const userSummary: PopulationUserSummary = {
    displayName: profile?.full_name || profile?.email || access.email || null,
    totalAnimals,
    shelterTypeLabel,
    dogsCount: hasDogs ? shelterRow?.initial_dogs ?? 0 : null,
    catsCount: hasCats ? shelterRow?.initial_cats ?? 0 : null,
  };

  return (
    <main>
      <PageHeader
        title="Registrar Dinâmica Populacional"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Dinâmica Populacional" },
        ]}
      />

      <PopulationDynamicsContent userSummary={userSummary} />
    </main>
  );
}
