import type { JSX } from "react";

import DatabaseDashboard from "@/components/data/database/DatabaseDashboard";
import PageHeader from "@/components/layout/PageHeader";
import { loadDatabaseDataset } from "@/lib/database/dataLoader";

export default function Page(): JSX.Element {
  const dataset = loadDatabaseDataset();

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
