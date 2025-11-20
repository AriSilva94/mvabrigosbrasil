import type { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import { libraryItems } from "@/data/libraryItems";
import { FileText } from "lucide-react";
import LibraryItemsShowcase from "@/components/content/LibraryItemsShowcase";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return libraryItems.map(({ slug }) => ({ slug }));
}

export default async function LibraryDetailPage({
  params,
}: PageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const item = libraryItems.find((entry) => entry.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <main>
      <PageHeader
        title={item.title}
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Biblioteca", href: "/biblioteca" },
          { label: item.title },
        ]}
      />

      <section className="bg-white py-14 md:py-16">
        <div className="container px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:gap-12 lg:gap-14">
            <div className="flex justify-start md:shrink-0">
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  width={400}
                  height={420}
                  className="object-contain"
                />
              </div>
            </div>

            <article className="flex w-full flex-col gap-4 text-brand-secondary md:w-1/2 md:max-w-full lg:justify-start lg:self-start">
              <p className="text-sm">
                Publicado em: {item.publishedAt ?? "Data não informada"}
              </p>

              <Link
                href={item.contentUrl ?? item.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <FileText className="h-6 w-6" aria-hidden />
                </span>
                <div className="text-left leading-tight">
                  <p className="text-base font-semibold text-brand-primary">
                    CONTEÚDO COMPLETO
                  </p>
                  <span className="text-sm text-brand-secondary">
                    Clique para ler!
                  </span>
                </div>
              </Link>

              <Heading as="h1" className="font-26 text-brand-secondary">
                {item.title}
              </Heading>
              <Text className="text-color-secondary leading-relaxed">
                {item.summary ??
                  "Material em preparação. Em breve você poderá acessar o conteúdo completo."}
              </Text>
            </article>
          </div>
        </div>
      </section>

      <section
        className="bg-white py-16 md:py-24"
        aria-labelledby="library-title"
      >
        <div className="container px-6">
          <header className="text-center">
            <Heading
              as="h2"
              id="library-title"
              className="font-34 text-brand-primary"
            >
              Publicações Relacionadas
            </Heading>
          </header>

          <LibraryItemsShowcase items={libraryItems} />
        </div>
      </section>
    </main>
  );
}
