import type { JSX } from "react";
import { redirect } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { buildMetadata } from "@/lib/seo";
import { loadUserAccess } from "@/lib/auth/teamAccess";
import { loadAdminShelters } from "@/modules/admin/adminPageData";

export const metadata = buildMetadata({
  title: "Banco de Abrigos",
  description: "Área administrativa para visualizar todos os abrigos cadastrados.",
  canonical: "/admin/abrigos",
});

export default async function Page(): Promise<JSX.Element> {
  const access = await loadUserAccess();

  if (!access || access.registerType !== REGISTER_TYPES.admin) {
    redirect("/painel");
  }

  const shelters = await loadAdminShelters();

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
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Abrigos cadastrados</h2>
              <p className="mt-1 text-sm text-slate-600">
                {shelters.length} abrigo{shelters.length === 1 ? "" : "s"} no sistema
              </p>
            </div>
          </div>

          <div className="overflow-hidden border-y border-slate-200">
            <div className="grid grid-cols-[1fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
              <span>Nome</span>
              <span>Identificador</span>
            </div>
            {shelters.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-600">
                Nenhum abrigo cadastrado.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {shelters.map((shelter) => (
                  <li
                    key={shelter.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4"
                  >
                    <span className="min-w-0 break-words font-medium text-slate-800">
                      {shelter.name}
                    </span>
                    <span className="text-sm tabular-nums text-slate-600">
                      {shelter.wp_post_id ?? `${shelter.id.slice(0, 8)} (novo)`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
