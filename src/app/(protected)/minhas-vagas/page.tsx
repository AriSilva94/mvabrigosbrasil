import type { JSX } from "react";
import { redirect } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { fetchVacanciesByShelter } from "@/services/vacanciesSupabase";
import MinhasVagasClient from "@/app/(protected)/minhas-vagas/components/MinhasVagasClient";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";

export const metadata = buildMetadata({
  title: "Minhas Vagas",
  description:
    "Gerencie e publique vagas de voluntariado do seu abrigo, com divulgação na comunidade da plataforma.",
  canonical: "/minhas-vagas",
});

export default async function Page(): Promise<JSX.Element> {
  const access = await enforceTeamAccess("/minhas-vagas");
  const supabaseAdmin = getSupabaseAdminClient();

  const { data: shelterRow, error: shelterError } = await supabaseAdmin
    .from("shelters")
    .select("id, name")
    .eq("profile_id", access.userId)
    .limit(1)
    .maybeSingle();

  if (shelterError && shelterError.code !== "42703") {
    console.error("minhas-vagas: erro ao buscar abrigo do usuário", shelterError);
  }

  const shelterName = shelterRow?.name ?? null;
  const shelterId = shelterRow?.id ?? null;

  if (access.registerType === REGISTER_TYPES.volunteer || access.registerType === REGISTER_TYPES.manager) {
    redirect("/painel");
  }

  let vacancies: UiVacancy[] = [];
  if (shelterId) {
    const { vacancies: dbVacancies } = await fetchVacanciesByShelter(
      supabaseAdmin,
      shelterId,
    );

    // Buscar contagem de candidaturas para cada vaga
    const vacanciesWithCounts = await Promise.all(
      dbVacancies.map(async (vacancy) => {
        const { count } = await supabaseAdmin
          .from("vacancy_applications")
          .select("*", { count: "exact", head: true })
          .eq("vacancy_id", vacancy.id);

        return {
          ...vacancy,
          applicationsCount: count || 0,
          source: "supabase" as const,
        };
      })
    );

    vacancies = vacanciesWithCounts;
  }

  return (
    <main>
      <PageHeader
        title="Minhas Vagas"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Minhas Vagas" },
        ]}
      />

      <section className="bg-white">
        <MinhasVagasClient
          vacancies={vacancies}
          shelterName={shelterName}
        />
      </section>
    </main>
  );
}
