interface VolunteerPageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: VolunteerPageProps) {
  const { slug } = await params;

  return (
    <main>
      <h1>TODO: Perfil do voluntário {slug}</h1>
      <p>Detalhes do voluntário em construção.</p>
    </main>
  );
}
