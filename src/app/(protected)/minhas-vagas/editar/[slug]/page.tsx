import type { JSX } from "react";
import { redirect, notFound } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES, type RegisterType } from "@/constants/registerTypes";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import EditVacancyClient from "@/app/(protected)/vaga/[slug]/components/EditVacancyClient";
import { buildVacancySlug, mapVacancyRow } from "@/services/vacanciesSupabase";
import { getVacancyProfileBySlug } from "@/services/vacanciesService";

type PageParams = {
  slug: string;
};

type SupabaseVacancyRow = {
  id: string;
  shelter_id: string | null;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
};

type UserContext = {
  postType: RegisterType | null;
  shelterId: string | null;
};

async function loadUserContext(): Promise<UserContext> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const postType = await resolvePostTypeForUser(supabaseAdmin, {
    supabaseUserId: data.user.id,
    email: data.user.email ?? null,
  }).catch((err) => {
    console.error("minhas-vagas/editar: erro ao resolver tipo de usuário", err);
    return null;
  });

  const { data: shelterRow, error: shelterError } = await supabaseAdmin
    .from("shelters")
    .select("id")
    .eq("profile_id", data.user.id)
    .limit(1)
    .maybeSingle();

  if (shelterError && shelterError.code !== "42703") {
    console.error(
      "minhas-vagas/editar: erro ao buscar abrigo do usuário",
      shelterError
    );
  }

  return {
    postType,
    shelterId: shelterRow?.id ?? null,
  };
}

async function loadVacancy(slug: string, shelterId: string | null): Promise<UiVacancy | null> {
  if (!slug || !shelterId) return null;
  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("vacancies")
    .select("id, shelter_id, title, description, status, created_at")
    .eq("shelter_id", shelterId);

  if (error) {
    console.error("minhas-vagas/editar: erro ao buscar vagas do abrigo", error);
  }

  const match = (data as SupabaseVacancyRow[] | null)?.find((row) => {
    const candidateSlug = buildVacancySlug(row.title ?? "Vaga", row.id);
    return candidateSlug === slug;
  });

  if (match) {
    return { ...mapVacancyRow(match), source: "supabase" };
  }

  const legacy = getVacancyProfileBySlug(slug);
  if (legacy) return { ...legacy, source: "legacy" };

  return null;
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const { postType, shelterId } = await loadUserContext();

  if (postType === REGISTER_TYPES.volunteer) {
    redirect("/painel");
  }

  if (!shelterId) {
    notFound();
  }

  const vacancy = await loadVacancy(slug, shelterId);
  if (!vacancy) {
    notFound();
  }

  return (
    <main>
      <PageHeader
        title="Editar Vaga"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Minhas Vagas", href: "/minhas-vagas" },
          { label: vacancy.title },
        ]}
      />

      <section className="bg-white">
        <div className="container px-6 py-10">
          <EditVacancyClient vacancy={vacancy} />
        </div>
      </section>
    </main>
  );
}
