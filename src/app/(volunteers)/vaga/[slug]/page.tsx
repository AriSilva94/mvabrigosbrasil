import type { JSX } from "react";
import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
import { Heading } from "@/components/ui/typography";
import { getVacancyProfileBySlug } from "@/services/vacanciesService";

type VacancyPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({
  params,
}: VacancyPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const vacancy = getVacancyProfileBySlug(slug);

  const displayTitle = vacancy?.title || "Vaga";
  const location =
    vacancy?.city && vacancy?.state
      ? `${vacancy.city} - ${vacancy.state}`
      : vacancy?.city || vacancy?.state || "Não informado";
  const periodInfo = [vacancy?.period, vacancy?.workload]
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
                    {vacancy?.title ?? "Vaga"}
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
                {vacancy?.shelter || "Não informado"}
              </p>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Descrição
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy?.description || "Não informado"}
              </p>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Habilidade e Funções
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy?.skills || "Não informado"}
              </p>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Perfil dos Voluntários
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy?.volunteerProfile || "Não informado"}
              </p>
            </div>

            <div>
              <Heading as="h3" className="text-base font-semibold text-brand-primary">
                Quantidade de Voluntários
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {vacancy?.quantity ?? "Não informado"}
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
