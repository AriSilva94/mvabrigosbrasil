import type { JSX } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";

import PageHeader from "@/components/layout/PageHeader";
import { Heading } from "@/components/ui/typography";
import ProfileField from "@/components/ui/ProfileField";
import EditVacancyClient from "@/app/(protected)/vaga/[slug]/components/EditVacancyClient";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import { buildMetadata } from "@/lib/seo";
import { normalizeWorkload } from "@/app/(protected)/minhas-vagas/constants";
import { getSession } from "@/lib/auth/session";
import { loadSharedVacancy } from "@/modules/vacancies/vacancyPageData";
import ApplyButton from "./components/ApplyButton";

type VacancyPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

const getVacancyBySlug = cache(async (slug: string): Promise<{
  vacancy: UiVacancy | null;
  canEdit: boolean;
  hasApplied: boolean;
  isAuthenticated: boolean;
}> => {
  const result = await loadSharedVacancy(slug, Boolean(await getSession()));
  return result ?? {
    vacancy: null,
    canEdit: false,
    hasApplied: false,
    isAuthenticated: false,
  };
});

function getLocation(vacancy: UiVacancy): string {
  if (vacancy.city && vacancy.state) return `${vacancy.city} - ${vacancy.state}`;
  return vacancy.city || vacancy.state || "Não informado";
}

export async function generateMetadata({
  params,
}: VacancyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { vacancy } = await getVacancyBySlug(slug);

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

function VacancyDetailView({
  vacancy,
  backHref,
  backLabel,
  hasApplied,
  isAuthenticated,
}: {
  vacancy: UiVacancy;
  backHref: string;
  backLabel: string;
  hasApplied: boolean;
  isAuthenticated: boolean;
}): JSX.Element {
  const displayTitle = vacancy.title || "Vaga";
  const location = getLocation(vacancy);
  const periodInfo = [vacancy.period, normalizeWorkload(vacancy.workload)]
    .filter(Boolean)
    .join(" / ");

  return (
    <main>
      <PageHeader
        title="Vaga de Voluntariado"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: backLabel, href: backHref },
          { label: displayTitle },
        ]}
      />

      <section className="container px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link
            href={backHref}
            className="inline-flex items-center text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
          >
            ← Voltar
          </Link>

          <article className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3 md:items-center">
                <div>
                  <Heading as="h2" className="text-lg font-semibold text-brand-primary">
                    Vaga
                  </Heading>
                  <p className="mt-1 text-base text-[#68707b]">
                    {vacancy.title ?? "Vaga"}
                  </p>
                </div>
                <div className="md:text-center">
                  <Heading as="h2" className="text-lg font-semibold text-brand-primary">
                    Período
                  </Heading>
                  <p className="mt-1 text-base text-[#68707b]">
                    {periodInfo || "Não informado"}
                  </p>
                </div>
                <div className="md:text-right">
                  <Heading as="h2" className="text-lg font-semibold text-brand-primary">
                    Cidade/Estado
                  </Heading>
                  <p className="mt-1 text-base text-[#68707b]">{location}</p>
                </div>
              </div>
            </div>

            <ProfileField label="Abrigo" value={vacancy.shelter} />
            <ProfileField label="Descrição" value={vacancy.description} />
            <ProfileField label="Habilidade e Funções" value={vacancy.skills} />
            <ProfileField label="Perfil dos Voluntários" value={vacancy.volunteerProfile} />
            <ProfileField label="Quantidade de Voluntários" value={vacancy.quantity} />

            <div className="pt-2">
              <ApplyButton
                vacancyId={vacancy.id}
                vacancyTitle={vacancy.title || "Vaga"}
                hasApplied={hasApplied}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default async function Page({
  params,
  searchParams,
}: VacancyPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const { from } = await searchParams;
  const { vacancy, canEdit, hasApplied, isAuthenticated } = await getVacancyBySlug(slug);

  if (!vacancy) redirect("/programa-de-voluntarios");

  const fromVagas = from === "vagas";
  const backHref = fromVagas ? "/vagas" : "/programa-de-voluntarios";
  const backLabel = fromVagas ? "Vagas" : "Programa de Voluntários";

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

  return (
    <VacancyDetailView
      vacancy={vacancy}
      backHref={backHref}
      backLabel={backLabel}
      hasApplied={hasApplied}
      isAuthenticated={isAuthenticated}
    />
  );
}
