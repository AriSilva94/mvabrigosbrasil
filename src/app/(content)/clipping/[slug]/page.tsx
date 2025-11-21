interface ClippingPageProps {
  params: { slug: string };
}

export default function Page({ params }: ClippingPageProps) {
  return (
    <main>
      <h1>TODO: Clipping {params.slug}</h1>
      <p>Detalhe da matéria em construção.</p>
    </main>
  );
}
