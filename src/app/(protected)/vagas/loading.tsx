import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { FormLoading } from "@/components/loading/FormLoading";

export default function Loading(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Vagas Disponíveis"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Vagas Disponíveis" },
        ]}
      />
      <section className="bg-white">
        <div className="container px-6 py-12">
          <FormLoading />
        </div>
      </section>
    </main>
  );
}
