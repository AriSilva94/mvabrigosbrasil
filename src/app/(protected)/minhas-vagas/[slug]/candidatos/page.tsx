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
          <ApplicationsList applications={applications || []} />
        </div>
      </section>
    </main>
  );
}
