import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { PartnersContentSection } from "@/components/institutional/partners";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Parceiros do Projeto",
  description:
    "Instituições, empresas e apoiadores que fortalecem a iniciativa Medicina de Abrigos Brasil.",
  canonical: "/parceiros",
});

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
