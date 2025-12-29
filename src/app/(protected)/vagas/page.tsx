import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Text } from "@/components/ui/typography";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { fetchVacancyCards } from "@/repositories/vacanciesRepository";
import VacancyListClient from "./components/VacancyListClient";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";

export const metadata = buildMetadata({
  title: "Vagas Disponíveis",
  description:
    "Lista de vagas disponíveis para voluntariado em abrigos e lares temporários.",
  canonical: "/vagas",
});

export default async function Page(): Promise<JSX.Element> {
  await enforceTeamAccess("/vagas");

  const supabase = getSupabaseAdminClient();
  const { vacancies, error } = await fetchVacancyCards(supabase);

  return (
    <main>
      <PageHeader
        title="Vagas Disponíveis"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Vagas Disponíveis" },
        ]}
      />

      {error ? (
        <section className="bg-white">
          <div className="container px-6 py-12">
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
              <Text className="text-red-800">
                Erro ao carregar vagas. Por favor, tente novamente mais tarde.
              </Text>
            </div>
          </div>
        </section>
      ) : (
        <VacancyListClient vacancies={vacancies} />
      )}
    </main>
  );
}
