import type { JSX } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import AppImage from "@/components/ui/AppImage";
import { Heading, Text } from "@/components/ui/typography";
import { REPORTS } from "@/constants/reports";
import { buildMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return REPORTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = REPORTS.find((entry) => entry.slug === slug);

  const description =
    report?.description ??
    "Relatório técnico da iniciativa Medicina de Abrigos Brasil.";

  return buildMetadata({
    title: report?.title ?? "Relatório",
    description,
    canonical: `/relatorios/${slug}`,
    image: report?.image,
  });
}

export default async function ReportDetailPage({
  params,
}: PageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const report = REPORTS.find((entry) => entry.slug === slug);

  if (!report) {
    notFound();
  }

  const relatedReports =
    REPORTS.length > 1
      ? REPORTS.filter((entry) => entry.slug !== slug)
      : REPORTS;

  const contentLink = report.contentUrl ?? `/relatorios/${slug}`;

  return (
    <main>
      <PageHeader
        title={report.title}
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Relatórios", href: "/relatorios" },
          { label: report.title },
        ]}
      />

      <section className="bg-white py-14 md:py-16">
        <div className="container px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:gap-12 lg:gap-14">
            <div className="flex justify-start md:shrink-0">
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <AppImage
                  src={report.image}
                  alt={report.title}
                  width={400}
                  height={420}
                  className="object-contain"
                />
              </div>
            </div>

            <article className="flex w-full flex-col gap-4 text-brand-secondary md:w-1/2 md:max-w-full lg:justify-start lg:self-start">
              <p className="text-sm">
                Publicado em: {report.publishedAt ?? "Data não informada"}
              </p>

              <Link
                href={contentLink}
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
                {report.title}
              </Heading>
              <Text className="text-color-secondary leading-relaxed">
                {report.description}
              </Text>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
