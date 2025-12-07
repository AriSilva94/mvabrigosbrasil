import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ShelterProfileForm from "./components/ShelterProfileForm";

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
        <ShelterProfileForm />
      </section>
    </main>
  );
}
