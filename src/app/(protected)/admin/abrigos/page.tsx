import type { JSX } from "react";
import { redirect } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { buildMetadata } from "@/lib/seo";
import { loadUserAccess } from "@/lib/auth/teamAccess";

export const metadata = buildMetadata({
  title: "Banco de Abrigos",
  description: "Área administrativa para visualizar todos os abrigos cadastrados.",
  canonical: "/admin/abrigos",
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
        title="Banco de Abrigos"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Abrigos" },
        ]}
      />

      <section className="bg-white">
        <div className="container px-6 py-14">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-slate-700">
              Banco de Abrigos
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Em desenvolvimento: aqui será possível visualizar e gerenciar todos os abrigos cadastrados na plataforma.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
