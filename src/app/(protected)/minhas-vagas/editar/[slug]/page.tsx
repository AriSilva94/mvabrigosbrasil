import type { JSX } from "react";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import EditVacancyClient from "@/app/(protected)/vaga/[slug]/components/EditVacancyClient";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";
import { ApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";
import { parseVacancyResponse } from "@/modules/vacancies/vacanciesApi";

type PageParams = {
  slug: string;
};

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

  if (access.registerType === REGISTER_TYPES.volunteer || access.registerType === REGISTER_TYPES.manager) {
    redirect("/painel");
  }

  let vacancy;
  try {
    vacancy = parseVacancyResponse(
      await serverApi<unknown>(`/vacancies/${encodeURIComponent(slug)}`),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
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
