import type { JSX } from "react";

import DatabaseDashboard from "@/components/data/database/DatabaseDashboard";
import PageHeader from "@/components/layout/PageHeader";
import { loadDatabaseDataset } from "@/lib/database/dataLoader";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata = buildMetadata({
  title: "Banco de Dados",
  description:
    "Visualize o banco de dados nacional de abrigos com filtros, gráficos e indicadores populacionais.",
  canonical: "/banco-de-dados",
});

export default async function Page(): Promise<JSX.Element> {
  const dataset = await loadDatabaseDataset();

  return (
    <main>
      <PageHeader
        title="Banco de Dados"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Banco de Dados" },
        ]}
      />
      <DatabaseDashboard dataset={dataset} />
    </main>
  );
}
