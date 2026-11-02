import type { JSX } from "react";
import { redirect } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import MinhasVagasClient from "@/app/(protected)/minhas-vagas/components/MinhasVagasClient";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";
import { loadOwnerVacanciesPageData } from "@/modules/vacancies/vacancyPageData";

export const metadata = buildMetadata({
  title: "Minhas Vagas",
  description:
    "Gerencie e publique vagas de voluntariado do seu abrigo, com divulgação na comunidade da plataforma.",
  canonical: "/minhas-vagas",
});

export default async function Page(): Promise<JSX.Element> {
  const access = await enforceTeamAccess("/minhas-vagas");

  if (access.registerType === REGISTER_TYPES.volunteer || access.registerType === REGISTER_TYPES.manager) {
    redirect("/painel");
  }
  const { shelterName, vacancies } = await loadOwnerVacanciesPageData();

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
        <MinhasVagasClient
          vacancies={vacancies}
          shelterName={shelterName}
        />
      </section>
    </main>
  );
}
