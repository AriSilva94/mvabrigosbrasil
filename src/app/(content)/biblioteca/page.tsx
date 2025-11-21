import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LibraryItemCard from "@/components/content/LibraryItemCard";
import { libraryItems } from "@/data/libraryItems";

const CATEGORIES = [
  {
    label: "Artigos Científicos",
    href: "/biblioteca?categoria=artigos-cientificos",
  },
  { label: "Guias e Manuais", href: "/biblioteca?categoria=guias-manuais" },
  {
    label: "Informativos Técnicos",
    href: "/biblioteca?categoria=informativos-tecnicos",
  },
];

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Biblioteca"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Biblioteca" }]}
      />

      <section className="bg-white py-12">
        <div className="container px-6">
          <p className="max-w-4xl text-lg text-color-secondary">
            Nesse local você encontra diversos materiais relacionados à Medicina
            de Abrigos. Entendemos a importância de termos informativos técnicos
            para melhorarmos os trabalhos e práticas com o intuito de promover a
            melhor qualidade e impacto de todos os envolvidos no ambiente de
            abrigos.
          </p>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3" aria-label="Categorias">
              {CATEGORIES.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>

            <form
              action="/biblioteca"
              method="get"
              className="flex w-full gap-3 md:w-auto"
              role="search"
            >
              <label htmlFor="library-search" className="sr-only">
                O que você procura?
              </label>
              <input
                id="library-search"
                name="s"
                type="text"
                placeholder="O que você procura?"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-brand-secondary md:w-64"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary"
              >
                Buscar
              </button>
            </form>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {libraryItems.map((item) => (
              <LibraryItemCard
                key={item.slug}
                {...item}
                href={`/biblioteca/${item.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
