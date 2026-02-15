import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";
import ApplicationsList from "./components/ApplicationsList";

type CandidatosPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CandidatosPage({
  params,
}: CandidatosPageProps) {
  const { slug } = await params;
  const access = await enforceTeamAccess(`/minhas-vagas/${slug}/candidatos`);

  const supabaseAdmin = getSupabaseAdminClient();

  // Buscar abrigo do usuário
  const { data: shelter } = await supabaseAdmin
    .from("shelters")
    .select("id, name")
    .eq("profile_id", access.userId)
    .maybeSingle();

  if (!shelter) redirect("/painel");

  // Buscar vaga do abrigo
  const { data: vacancy } = await supabaseAdmin
    .from("vacancies")
    .select("id, title, slug, shelter_id")
    .eq("slug", slug)
    .eq("shelter_id", shelter.id)
    .maybeSingle();

  if (!vacancy) notFound();

  // Buscar candidaturas com dados do voluntário
  const { data: applications } = await supabaseAdmin
    .from("vacancy_applications")
    .select(`
      id,
      status,
      applied_at,
      volunteers (
        id,
        name,
        cidade,
        estado,
        telefone,
        profissao,
        experiencia,
        slug
      )
    `)
    .eq("vacancy_id", vacancy.id)
    .order("applied_at", { ascending: false });

  // Buscar threads de chat para esta vaga (para botão "Conversar")
  const { data: threads } = await supabaseAdmin
    .from("chat_threads")
    .select("id, volunteer_profile_id")
    .eq("vacancy_id", vacancy.id);

  // Mapear volunteer_id (volunteers.owner_profile_id) → thread_id
  // Precisamos buscar o profile_id dos voluntários que se candidataram
  const volunteerIds = (applications || [])
    .map((a) => (a.volunteers as { id: string } | null)?.id)
    .filter((id): id is string => !!id);

  let threadMap: Record<string, string> = {};
  if (volunteerIds.length > 0 && threads && threads.length > 0) {
    const { data: volunteerProfiles } = await supabaseAdmin
      .from("volunteers")
      .select("id, owner_profile_id")
      .in("id", volunteerIds);

    if (volunteerProfiles) {
      // volunteer.id → profile_id
      const volToProfile = new Map(
        volunteerProfiles.map((v) => [v.id, v.owner_profile_id])
      );
      // profile_id → thread_id
      const profileToThread = new Map(
        threads.map((t) => [t.volunteer_profile_id, t.id])
      );
      // volunteer.id → thread_id
      for (const [volId, profileId] of volToProfile) {
        if (profileId) {
          const tid = profileToThread.get(profileId);
          if (tid) threadMap[volId] = tid;
        }
      }
    }
  }

  return (
    <main>
      <PageHeader
        title={`Candidatos - ${vacancy.title || "Vaga"}`}
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Minhas Vagas", href: "/minhas-vagas" },
          { label: vacancy.title || "Vaga" },
        ]}
      />

      <section className="bg-white">
        <div className="container px-6 py-12">
          <ApplicationsList
            applications={applications || []}
            threadMap={threadMap}
          />
        </div>
      </section>
    </main>
  );
}
