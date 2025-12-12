import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ShelterProfileForm from "@/app/(protected)/meu-cadastro/components/ShelterProfileForm";
import VolunteerProfileForm from "@/app/(protected)/meu-cadastro/components/VolunteerProfileForm";
import { ShelterHistoryTimeline } from "@/app/(protected)/meu-cadastro/components/ShelterHistoryTimeline";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";

async function loadUserPostType(): Promise<string | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  const supabaseAdmin = getSupabaseAdminClient();

  return resolvePostTypeForUser(supabaseAdmin, {
    supabaseUserId: data.user.id,
    email: data.user.email ?? null,
  });
}

export default async function Page(): Promise<JSX.Element> {
  const postType = await loadUserPostType();
  const isVolunteer = postType === "voluntario";

  return (
    <main>
      <PageHeader
        title={isVolunteer ? "Meu Cadastro" : "Meu Abrigo"}
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: isVolunteer ? "Meu Cadastro" : "Meu Abrigo" },
        ]}
      />

      <section className="bg-white px-4 py-14 md:px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          {isVolunteer ? <VolunteerProfileForm /> : <ShelterProfileForm />}
          {!isVolunteer && <ShelterHistoryTimeline />}
        </div>
      </section>
    </main>
  );
}
