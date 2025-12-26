import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import PopulationDynamicsContent from "./components/PopulationDynamicsContent";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Registrar Dinâmica Populacional",
  description:
    "Formulário para registrar entradas, saídas e dinâmica populacional dos animais atendidos pelo abrigo.",
  canonical: "/dinamica-populacional",
});

export default function Page(): JSX.Element {
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

      <PopulationDynamicsContent />
    </main>
  );
}
