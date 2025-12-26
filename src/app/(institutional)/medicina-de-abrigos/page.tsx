import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { ShelterMedicineSection } from "@/components/institutional/shelter-medicine";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Medicina de Abrigos",
  description:
    "Entenda o que é medicina de abrigos e como aplicamos ciência, gestão e bem-estar para proteger animais acolhidos.",
  canonical: "/medicina-de-abrigos",
});

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
