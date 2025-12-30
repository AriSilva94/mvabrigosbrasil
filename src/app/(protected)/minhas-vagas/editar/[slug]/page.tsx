import type { JSX } from "react";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import type { Database } from "@/lib/supabase/types";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import EditVacancyClient from "@/app/(protected)/vaga/[slug]/components/EditVacancyClient";
import { buildVacancySlug, mapVacancyRow } from "@/services/vacanciesSupabase";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";

type VacancyRow = Database["public"]["Tables"]["vacancies"]["Row"];

type PageParams = {
  slug: string;
};

async function loadVacancy(slug: string, shelterId: string | null): Promise<UiVacancy | null> {
  if (!slug || !shelterId) return null;
  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("vacancies")
    .select("*")
    .eq("shelter_id", shelterId);

  if (error) {
    console.error("minhas-vagas/editar: erro ao buscar vagas do abrigo", error);
  }

  const match = data?.find((row: any) => {
    const candidateSlug = buildVacancySlug(row.title ?? "Vaga", row.id);
    return candidateSlug === slug;
  });

  if (match) {
    return { ...mapVacancyRow(match as VacancyRow), source: "supabase" };
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  return buildMetadata({
    title: "Editar Vaga",
    description: "Edite uma vaga de voluntariado publicada pelo seu abrigo.",
    canonical: `/minhas-vagas/editar/${slug}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const access = await enforceTeamAccess("/minhas-vagas/editar");

  if (access.registerType === REGISTER_TYPES.volunteer) {
    redirect("/painel");
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: shelterRow, error: shelterError } = await supabaseAdmin
    .from("shelters")
    .select("id")
    .eq("profile_id", access.userId)
    .limit(1)
    .maybeSingle();

  if (shelterError && shelterError.code !== "42703") {
    console.error(
      "minhas-vagas/editar: erro ao buscar abrigo do usuário",
      shelterError
    );
  }

  const shelterId = shelterRow?.id ?? null;

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
