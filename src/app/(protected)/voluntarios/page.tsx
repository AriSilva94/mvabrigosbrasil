import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Text } from "@/components/ui/typography";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { fetchVolunteerCards } from "@/repositories/volunteersRepository";
import VolunteerListClient from "./components/VolunteerListClient";

export default async function Page(): Promise<JSX.Element> {
  const supabase = getSupabaseAdminClient();
  const { volunteers, error } = await fetchVolunteerCards(supabase);

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
