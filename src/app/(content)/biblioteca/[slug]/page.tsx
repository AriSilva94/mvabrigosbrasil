import type { JSX } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText } from "lucide-react";

import LibraryItemsShowcase from "@/components/content/LibraryItemsShowcase";
import PageHeader from "@/components/layout/PageHeader";
import AppImage from "@/components/ui/AppImage";
import { Heading } from "@/components/ui/typography";
import { libraryItems } from "@/data/libraryItems";
import { buildMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return libraryItems.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = libraryItems.find((entry) => entry.slug === slug);

  const description =
    item?.summary ??
    "Publicação técnica da biblioteca de medicina de abrigos com acesso ao material completo.";

  return buildMetadata({
    title: item?.title ?? "Publicação da Biblioteca",
    description,
    canonical: `/biblioteca/${slug}`,
    image: item?.imageSrc,
  });
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
                <AppImage
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

              {!item.externalLinkText && (
                <Link
                  href={item.contentUrl}
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
              )}

              <div className="text-color-secondary leading-relaxed space-y-4">
                {item.summary ? (
                  item.summary.split("\n\n").map((paragraph, index) => (
                    <p key={index}>
                      {paragraph.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                        part.match(/^https?:\/\//) ? (
                          <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary hover:underline break-all"
                          >
                            {part}
                          </a>
                        ) : (
                          part
                        ),
                      )}
                    </p>
                  ))
                ) : (
                  <> </>
                )}
                {item.externalLinkText && item.contentUrl && (
                  <p>
                    <Link
                      href={item.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-primary hover:underline"
                    >
                      {item.externalLinkText}
                    </Link>
                  </p>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* <section
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
      </section> */}
    </main>
  );
}
