import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { ReportsSection } from "@/components/data/reports";
import { REPORTS } from "@/constants/reports";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Relatórios",
  description:
    "Relatórios e resultados parciais com análises populacionais dos abrigos e lares temporários do Brasil.",
  canonical: "/relatorios",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Relatórios"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Relatórios" }]}
      />
      <ReportsSection reports={REPORTS} />
    </main>
  );
}
