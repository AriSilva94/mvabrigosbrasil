import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { PartnersContentSection } from "@/components/institutional/partners";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Parceiros do Projeto"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Parceiros do Projeto" },
        ]}
      />

      <PartnersContentSection />
    </main>
  );
}
