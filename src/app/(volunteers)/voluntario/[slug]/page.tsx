interface VolunteerPageProps {
  params: { slug: string };
}

export default function Page({ params }: VolunteerPageProps) {
  return (
    <main>
      <h1>TODO: Perfil do voluntário {params.slug}</h1>
      <p>Detalhes do voluntário em construção.</p>
    </main>
  );
}
