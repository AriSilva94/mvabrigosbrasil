import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ShelterProfileForm from "@/app/(protected)/meu-cadastro/components/ShelterProfileForm";
import { ShelterHistoryTimeline } from "@/app/(protected)/meu-cadastro/components/ShelterHistoryTimeline";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Meu Abrigo"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Meu Abrigo" },
        ]}
      />

      <section className="bg-white px-4 py-14 md:px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          <ShelterProfileForm />
          <ShelterHistoryTimeline />
        </div>
      </section>
    </main>
  );
}
