import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { ReportsSection } from "@/components/data/reports";
import { REPORTS } from "@/constants/reports";

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
