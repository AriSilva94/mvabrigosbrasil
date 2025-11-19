interface VacancyPageProps {
  params: { slug: string };
}

export default function Page({ params }: VacancyPageProps) {
  return (
    <main>
      <h1>TODO: Vaga {params.slug}</h1>
      <p>Detalhes da vaga em construção.</p>
    </main>
  );
}
