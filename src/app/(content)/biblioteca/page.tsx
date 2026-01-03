"use client";

import type { JSX } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LibraryItemCard from "@/components/content/LibraryItemCard";
import { libraryItems } from "@/data/libraryItems";

const CATEGORIES = [
  {
    label: "Artigos Científicos",
    value: "artigos-cientificos",
    categoryName: "Artigos Científicos",
  },
  {
    label: "Guias e Manuais",
    value: "guias-manuais",
    categoryName: "Guias/Manuais",
  },
  {
    label: "Informativos Técnicos",
    value: "informativos-tecnicos",
    categoryName: "Informativos Técnicos",
  },
  {
    label: "Livros",
    value: "livros",
    categoryName: "Livros",
  },
];

export default function Page(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derivar estado diretamente dos URL params
  const activeCategory = searchParams.get("categoria");
  const searchParamValue = searchParams.get("s") || "";

  // Estado local apenas para controlar o input (não afeta a filtragem)
  const [searchInputValue, setSearchInputValue] = useState(searchParamValue);

  // Sincronizar o campo de busca com o parâmetro da URL
  useEffect(() => {
    setSearchInputValue(searchParamValue);
  }, [searchParamValue]);

  // Normalizar string para comparação (remove acentos, converte para lowercase)
  const normalizeString = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Filtrar itens baseado em categoria e busca (usa apenas searchParamValue da URL)
  const filteredItems = useMemo(() => {
    let items = [...libraryItems];

    // Filtrar por categoria
    if (activeCategory) {
      const category = CATEGORIES.find((cat) => cat.value === activeCategory);
      if (category) {
        items = items.filter((item) => item.category === category.categoryName);
      }
    }

    // Filtrar por busca (usa o valor da URL, não o estado do input)
    if (searchParamValue.trim()) {
      const normalizedSearch = normalizeString(searchParamValue.trim());
      items = items.filter((item) => {
        const normalizedTitle = normalizeString(item.title);
        const normalizedCategory = normalizeString(item.category);
        const normalizedSummary = normalizeString(item.summary || "");

        return (
          normalizedTitle.includes(normalizedSearch) ||
          normalizedCategory.includes(normalizedSearch) ||
          normalizedSummary.includes(normalizedSearch)
        );
      });
    }

    return items;
  }, [activeCategory, searchParamValue]);

  // Handler para filtro de categoria
  const handleCategoryClick = (categoryValue: string) => {
    const newCategory = activeCategory === categoryValue ? null : categoryValue;

    // Atualizar URL
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set("categoria", newCategory);
    } else {
      params.delete("categoria");
    }
    router.push(`/biblioteca${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // Handler para busca
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    if (searchInputValue.trim()) {
      params.set("s", searchInputValue.trim());
    } else {
      params.delete("s");
    }
    router.push(`/biblioteca${params.toString() ? `?${params.toString()}` : ""}`);
  };

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
              {CATEGORIES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleCategoryClick(value)}
                  className={`rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === value
                      ? "bg-brand-primary text-white"
                      : "text-brand-primary hover:bg-brand-primary hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSearch}
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
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
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

          {/* Indicador de filtros ativos */}
          {(activeCategory || searchParamValue) && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-600">
                {filteredItems.length} {filteredItems.length === 1 ? "resultado encontrado" : "resultados encontrados"}
              </span>
              {activeCategory && (
                <button
                  onClick={() => handleCategoryClick(activeCategory)}
                  className="flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-sm text-brand-primary"
                >
                  {CATEGORIES.find((cat) => cat.value === activeCategory)?.label}
                  <span className="text-lg leading-none">&times;</span>
                </button>
              )}
              {searchParamValue && (
                <button
                  onClick={() => {
                    setSearchInputValue("");
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("s");
                    router.push(`/biblioteca${params.toString() ? `?${params.toString()}` : ""}`);
                  }}
                  className="flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-sm text-brand-primary"
                >
                  Busca: &ldquo;{searchParamValue}&rdquo;
                  <span className="text-lg leading-none">&times;</span>
                </button>
              )}
            </div>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <LibraryItemCard
                  key={item.slug}
                  {...item}
                  href={`/biblioteca/${item.slug}`}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-lg text-gray-600">
                  Nenhum resultado encontrado para sua busca.
                </p>
                <button
                  onClick={() => {
                    setSearchInputValue("");
                    router.push("/biblioteca");
                  }}
                  className="mt-4 text-brand-primary underline hover:text-brand-secondary"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
