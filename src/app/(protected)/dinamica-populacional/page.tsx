import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import PopulationDynamicsContent from "./components/PopulationDynamicsContent";

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
