import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { MateriasSection } from "@/components/content/materias";
import { MATERIAS_HEADING, MATERIAS_ITEMS } from "@/constants/materias";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Matérias",
  description:
    "Matérias e reportagens sobre o projeto Medicina de Abrigos Brasil e o mapeamento nacional de abrigos.",
  canonical: "/materias",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Matérias"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Matérias" }]}
      />
      <MateriasSection heading={MATERIAS_HEADING} items={MATERIAS_ITEMS} />
    </main>
  );
}
