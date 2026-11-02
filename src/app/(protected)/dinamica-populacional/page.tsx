import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import PopulationDynamicsContent from "./components/PopulationDynamicsContent";
import { TourTrigger } from "@/components/tour/TourTrigger";
import { buildMetadata } from "@/lib/seo";
import { loadPopulationDynamicsPageData } from "@/modules/dynamics/dynamicsPageData";

export const metadata = buildMetadata({
  title: "Registrar Dinâmica Populacional",
  description:
    "Formulário para registrar entradas, saídas e dinâmica populacional dos animais atendidos pelo abrigo.",
  canonical: "/dinamica-populacional",
});

export default async function Page(): Promise<JSX.Element> {
  const { access, userSummary } = await loadPopulationDynamicsPageData();

  return (
    <main>
      <PageHeader
        title="Registrar Dinâmica Populacional"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Dinâmica Populacional" },
        ]}
      />

      <PopulationDynamicsContent
        userSummary={userSummary}
        isTeamOnly={access.isTeamOnly}
      />

      <TourTrigger tourName="dinamica-populacional-tour" />
    </main>
  );
}
