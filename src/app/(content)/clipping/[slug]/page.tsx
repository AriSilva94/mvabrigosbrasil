interface ClippingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: ClippingPageProps) {
  const { slug } = await params;

  return (
    <main className="container px-6 py-12">
      <h1 className="font-34 font-semibold text-brand-secondary">
        TODO: Clipping {slug}
      </h1>
      <p className="mt-4 text-base text-slate-600">
        Detalhe da matéria em construção.
      </p>
    </main>
  );
}
