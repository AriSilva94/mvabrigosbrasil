import type { JSX } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import PageHeader from "@/components/layout/PageHeader";
import { Heading } from "@/components/ui/typography";
import EditVacancyClient from "@/app/(protected)/vaga/[slug]/components/EditVacancyClient";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import { extractVacancyIdFromSlug, mapVacancyRow } from "@/services/vacanciesSupabase";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { buildMetadata } from "@/lib/seo";

type SupabaseVacancyRow = {
  id: string;
  shelter_id: string | null;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
};

type VacancyPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadUserContext() {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { userId: null, postType: null, shelterId: null };

  const supabaseAdmin = getSupabaseAdminClient();
  const postType = await resolvePostTypeForUser(supabaseAdmin, {
    supabaseUserId: data.user.id,
    email: data.user.email ?? null,
  }).catch(() => null);

  const { data: shelterRow } = await supabaseAdmin
    .from("shelters")
    .select("id")
    .eq("profile_id", data.user.id)
    .limit(1)
    .maybeSingle();

  return { userId: data.user.id, postType, shelterId: shelterRow?.id ?? null };
}

async function loadVacancy(slug: string): Promise<{
  vacancy: UiVacancy | null;
  canEdit: boolean;
}> {
  const { postType, shelterId } = await loadUserContext();

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: supabaseData } = await supabaseAdmin
    .from("vacancies")
    .select("id, shelter_id, title, description, status, created_at, slug")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle<SupabaseVacancyRow & { slug: string }>();

  if (!supabaseData) {
    return { vacancy: null, canEdit: false };
  }

  const mapped = {
    ...mapVacancyRow({
      id: supabaseData.id,
      shelter_id: supabaseData.shelter_id,
      title: supabaseData.title,
      description: supabaseData.description,
      status: supabaseData.status,
      created_at: supabaseData.created_at,
    }),
    source: "supabase",
  } as UiVacancy;
  const canEdit =
    postType === REGISTER_TYPES.shelter &&
    !!shelterId &&
    supabaseData.shelter_id === shelterId;
  return { vacancy: mapped, canEdit };
}

export async function generateMetadata({
  params,
}: VacancyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { vacancy } = await loadVacancy(slug);

  const displayTitle = vacancy?.title ?? "Vaga de voluntariado";
  const location =
    vacancy?.city && vacancy?.state
      ? `${vacancy.city} - ${vacancy.state}`
      : vacancy?.city || vacancy?.state || null;
  const descriptionParts = [
    vacancy?.shelter ? `Abrigo: ${vacancy.shelter}` : null,
    location ? `Local: ${location}` : null,
    vacancy?.period ? `Período: ${vacancy.period}` : null,
  ].filter(Boolean);

  const description =
    descriptionParts.join(" • ") ||
    "Detalhes da vaga de voluntariado disponível no programa da Medicina de Abrigos Brasil.";

  return buildMetadata({
    title: displayTitle,
    description,
    canonical: `/vaga/${slug}`,
  });
}

export default async function Page({
  params,
}: VacancyPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const { vacancy, canEdit } = await loadVacancy(slug);

  if (!vacancy) redirect("/programa-de-voluntarios");

  if (canEdit) {
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

  const displayTitle = vacancy.title || "Vaga";
  const location =
    vacancy.city && vacancy.state
      ? `${vacancy.city} - ${vacancy.state}`
      : vacancy.city || vacancy.state || "Não informado";
  const periodInfo = [vacancy.period, vacancy.workload]
    .filter(Boolean)
    .join(" / ");

  return (
    <main>
      <PageHeader
        title="Vaga de Voluntariado"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Programa de Voluntários", href: "/programa-de-voluntarios" },
          { label: displayTitle },
        ]}
      />

      <section className="container px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link
            href="/programa-de-voluntarios"
            className="inline-flex items-center text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
          >
            ← Voltar
          </Link>

          <article className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3 md:items-center">
                <div>
                  <Heading
                    as="h2"
                    className="text-lg font-semibold text-brand-primary"
                  >
                    Vaga
                  </Heading>
                  <p className="mt-1 text-base text-[#68707b]">
                    {vacancy.title ?? "Vaga"}
                  </p>
                </div>
                <div className="md:text-center">
                  <Heading
                    as="h2"
                    className="text-lg font-semibold text-brand-primary"
                  >
                    Período
                  </Heading>
                  <p className="mt-1 text-base text-[#68707b]">
                    {periodInfo || "Não informado"}
                  </p>
                </div>
                <div className="md:text-right">
                  <Heading
                    as="h2"
                    className="text-lg font-semibold text-brand-primary"
                  >
                    Cidade/Estado
                  </Heading>
                  <p className="mt-1 text-base text-[#68707b]">{location}</p>
                </div>
              </div>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Abrigo
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy.shelter || "Não informado"}
              </p>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Descrição
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy.description || "Não informado"}
              </p>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Habilidade e Funções
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy.skills || "Não informado"}
              </p>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Perfil dos Voluntários
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy.volunteerProfile || "Não informado"}
              </p>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Quantidade de Voluntários
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy.quantity ?? "Não informado"}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="https://mvabrigosbrasil.com.br/register/?tipo=voluntario"
                className="inline-flex items-center rounded-full bg-brand-primary px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                Quero ser voluntário
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
