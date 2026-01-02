import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Text } from "@/components/ui/typography";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { fetchVolunteerCardsFromSupabase } from "@/services/volunteersAggregator";
import VolunteerListClient from "./components/VolunteerListClient";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";

export const metadata = buildMetadata({
  title: "Voluntários",
  description:
    "Lista de voluntários cadastrados e prontos para apoiar abrigos e lares temporários na plataforma.",
  canonical: "/voluntarios",
});

export default async function Page(): Promise<JSX.Element> {
  await enforceTeamAccess("/voluntarios");

  const supabase = getSupabaseAdminClient();
  const { volunteers, error } = await fetchVolunteerCardsFromSupabase(supabase);

  return (
    <main>
      <PageHeader
        title="Voluntários"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Voluntários" },
        ]}
      />

      {error ? (
        <section className="bg-white">
          <div className="container px-6 py-12">
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
              <Text className="text-red-800">
                Erro ao carregar voluntários. Por favor, tente novamente mais tarde.
              </Text>
            </div>
          </div>
        </section>
      ) : (
        <VolunteerListClient volunteers={volunteers} />
      )}
    </main>
  );
}
