import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { MateriasSection } from "@/components/content/materias";
import { MATERIAS_HEADING, MATERIAS_ITEMS } from "@/constants/materias";

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
