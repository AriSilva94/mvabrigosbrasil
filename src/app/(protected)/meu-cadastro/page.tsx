import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ShelterProfileForm from "@/app/(protected)/meu-cadastro/components/ShelterProfileForm";
import VolunteerProfileForm from "@/app/(protected)/meu-cadastro/components/VolunteerProfileForm";
import { ShelterHistoryTimeline } from "@/app/(protected)/meu-cadastro/components/ShelterHistoryTimeline";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";

export const metadata = buildMetadata({
  title: "Meu Cadastro",
  description:
    "Atualize os dados do abrigo ou perfil de voluntário e acompanhe o histórico de envios na plataforma.",
  canonical: "/meu-cadastro",
});

export default async function Page(): Promise<JSX.Element> {
  const access = await enforceTeamAccess("/meu-cadastro");
  const isVolunteer = access.registerType === REGISTER_TYPES.volunteer;

  return (
    <main>
      <PageHeader
        title={isVolunteer ? "Meu Cadastro" : "Meu Abrigo"}
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: isVolunteer ? "Meu Cadastro" : "Meu Abrigo" },
        ]}
      />

      <section className="bg-white px-4 py-14 md:px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          {isVolunteer ? <VolunteerProfileForm /> : <ShelterProfileForm />}
          {!isVolunteer && <ShelterHistoryTimeline />}
        </div>
      </section>
    </main>
  );
}
