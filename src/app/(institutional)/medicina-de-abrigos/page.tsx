import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { ShelterMedicineSection } from "@/components/institutional/shelter-medicine";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Medicina de Abrigos"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Medicina de Abrigos" },
        ]}
      />
      <ShelterMedicineSection />
    </main>
  );
}
