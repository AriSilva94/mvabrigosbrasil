import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import PopulationDynamicsContent from "./components/PopulationDynamicsContent";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";
import { getDynamicsUserSummary } from "@/modules/dynamics/getDynamicsUserSummary";

export const metadata = buildMetadata({
  title: "Registrar Dinâmica Populacional",
  description:
    "Formulário para registrar entradas, saídas e dinâmica populacional dos animais atendidos pelo abrigo.",
  canonical: "/dinamica-populacional",
});

export default async function Page(): Promise<JSX.Element> {
  const access = await enforceTeamAccess("/dinamica-populacional");

  const { summary: userSummary } = await getDynamicsUserSummary({
    userId: access.userId,
    fallbackEmail: access.email,
  });

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

      <PopulationDynamicsContent userSummary={userSummary} />
    </main>
  );
}
