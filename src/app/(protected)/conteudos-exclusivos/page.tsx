import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Conteúdos Exclusivos",
  description:
    "Materiais exclusivos para usuários cadastrados, incluindo livros digitais e referências de medicina de abrigos.",
  canonical: "/conteudos-exclusivos",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Conteúdos Exclusivos"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Conteúdos Exclusivos" },
        ]}
      />

      <section className="bg-white py-12">
        <div className="container px-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <a
              href="/assets/pdf/Livro-digital-Medicina-de-abrigos-principios-e-diretrizes_1140-pag-106-113.pdf"
              target="_blank"
              rel="noreferrer noopener"
              className="block px-5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <p className="text-sm font-semibold text-brand-primary">
                Livro digital medicina de abrigos
              </p>
              <p className="mt-1 text-lg text-brand-secondary">
                Livro dividido em 10 seções, e conta com a contribuição de mais
                de 60 colaboradores.
              </p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
