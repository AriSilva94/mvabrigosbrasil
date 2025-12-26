import type { JSX } from "react";
import { redirect } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES, type RegisterType } from "@/constants/registerTypes";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";
import { getVacanciesByShelterName } from "@/services/vacanciesService";
import type { VacancyProfile } from "@/types/vacancies.types";
import MinhasVagasClient from "@/app/(protected)/minhas-vagas/components/MinhasVagasClient";

type UserContext = {
  postType: RegisterType | null;
  shelterName: string | null;
};

async function loadUserContext(): Promise<UserContext> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { postType: null, shelterName: null };
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const postType = await resolvePostTypeForUser(supabaseAdmin, {
    supabaseUserId: data.user.id,
    email: data.user.email ?? null,
  }).catch((err) => {
    console.error("minhas-vagas: erro ao resolver tipo de usuário", err);
    return null;
  });

  const { data: shelterRow, error: shelterError } = await supabaseAdmin
    .from("shelters")
    .select("name")
    .eq("profile_id", data.user.id)
    .limit(1)
    .maybeSingle();

  if (shelterError && shelterError.code !== "42703") {
    console.error("minhas-vagas: erro ao buscar abrigo do usuário", shelterError);
  }

  return {
    postType,
    shelterName: shelterRow?.name ?? null,
  };
}

export default async function Page(): Promise<JSX.Element> {
  const { postType, shelterName } = await loadUserContext();

  if (postType === REGISTER_TYPES.volunteer) {
    redirect("/painel");
  }

  const vacancies: VacancyProfile[] =
    shelterName && shelterName.trim().length > 0
      ? getVacanciesByShelterName(shelterName)
      : [];

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
        <MinhasVagasClient vacancies={vacancies} shelterName={shelterName} />
      </section>
    </main>
  );
}
