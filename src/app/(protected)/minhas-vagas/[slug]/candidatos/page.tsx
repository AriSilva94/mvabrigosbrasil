import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { ApiError } from "@/lib/api/errors";
import { loadCandidatesPageData } from "@/modules/vacancies/vacancyPageData";
import ApplicationsList from "./components/ApplicationsList";

type CandidatosPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CandidatosPage({
  params,
}: CandidatosPageProps) {
  const { slug } = await params;
  const access = await enforceTeamAccess(`/minhas-vagas/${slug}/candidatos`);
  if (access.registerType !== REGISTER_TYPES.shelter) redirect("/painel");
  let data;
  try {
    data = await loadCandidatesPageData(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const { vacancy, applications } = data;

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
            applications={applications}
          />
        </div>
      </section>
    </main>
  );
}
