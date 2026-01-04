import type { JSX } from "react";
import { redirect } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { buildMetadata } from "@/lib/seo";
import { loadUserAccess } from "@/lib/auth/teamAccess";
import ManagersPageContent from "./components/ManagersPageContent";

export const metadata = buildMetadata({
  title: "Gerenciar Gerentes",
  description: "Área administrativa para gerenciar gerentes da plataforma.",
  canonical: "/admin/gerentes",
});

export default async function Page(): Promise<JSX.Element> {
  const access = await loadUserAccess();

  // Apenas admins podem acessar esta página
  if (!access || access.registerType !== REGISTER_TYPES.admin) {
    redirect("/painel");
  }

  return (
    <main>
      <PageHeader
        title="Gerenciar Gerentes"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Gerentes" },
        ]}
      />

      <section className="bg-white">
        <div className="container px-6 py-14">
          <ManagersPageContent />
        </div>
      </section>
    </main>
  );
}
