interface VacancyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: VacancyPageProps) {
  const { slug } = await params;

  return (
    <main>
      <h1>TODO: Vaga {slug}</h1>
      <p>Detalhes da vaga em construção.</p>
    </main>
  );
}
