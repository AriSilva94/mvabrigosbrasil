import PageHeader from "@/components/layout/PageHeader";
import { MATERIAS_ITEMS } from "@/constants/materias";

interface ClippingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: ClippingPageProps) {
  const { slug } = await params;
  const article =
    MATERIAS_ITEMS.find((item) => item.href.endsWith(slug)) ?? null;

  return (
    <main>
      <PageHeader
        title={article?.title ?? "Matéria"}
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Biblioteca", href: "/biblioteca", allowActiveLink: true },
        ]}
      />

      <section className="container px-6 py-12">
        <h1 className="font-34 font-semibold text-brand-secondary">
          {article?.title ?? "Conteúdo em construção"}
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Em breve você encontrará os detalhes completos desta matéria aqui no
          portal.
        </p>
      </section>
    </main>
  );
}
