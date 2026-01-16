import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import LibraryItemsShowcase from "@/components/content/LibraryItemsShowcase";
import PageHeader from "@/components/layout/PageHeader";
import { Heading } from "@/components/ui/typography";
import { MATERIAS_ITEMS } from "@/constants/materias";
import { libraryItems } from "@/data/libraryItems";
import { buildMetadata } from "@/lib/seo";

interface ClippingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ClippingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = MATERIAS_ITEMS.find((item) => item.href.endsWith(slug));

  if (!article) {
    return buildMetadata({
      title: "Matéria não encontrada",
      description: "A matéria solicitada não foi encontrada.",
      canonical: `/clipping/${slug}`,
    });
  }

  return buildMetadata({
    title: article.title,
    description: `${article.title} - Publicado em ${article.publishedAt}. Confira a matéria completa sobre a iniciativa Medicina de Abrigos Brasil.`,
    canonical: `/clipping/${slug}`,
  });
}

export default async function ClippingPage({ params }: ClippingPageProps) {
  const { slug } = await params;
  const article = MATERIAS_ITEMS.find((item) => item.href.endsWith(slug));

  if (!article) {
    notFound();
  }

  return (
    <main>
      <PageHeader
        title={article.title}
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Biblioteca", href: "/biblioteca", allowActiveLink: true },
        ]}
      />

      <section className="container px-6 py-12">
        <article className="mx-auto flex max-w-3xl flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="flex-1">
            <p className="text-brand-primary">
              Publicado em: <time>{article.publishedAt}</time>
            </p>

            <Link
              href={article.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-4 rounded-lg border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <FileText
                size={48}
                className="shrink-0 text-brand-primary"
                aria-hidden="true"
              />
              <div>
                <span className="block font-semibold text-brand-primary">
                  CONTEÚDO COMPLETO
                </span>
                <span className="text-sm text-gray-600">Clique para ler!</span>
              </div>
            </Link>
          </div>
        </article>
      </section>

      <hr className="container border-gray-200" />

      <section
        className="bg-white py-16 md:py-24"
        aria-labelledby="related-publications-title"
      >
        <div className="container px-6">
          <header className="text-center">
            <Heading
              as="h2"
              id="related-publications-title"
              className="font-34 text-brand-primary"
            >
              Publicações Relacionadas
            </Heading>
          </header>

          <LibraryItemsShowcase items={libraryItems.slice(0, 4)} />
        </div>
      </section>
    </main>
  );
}
