import PageHeader from "@/components/layout/PageHeader";
import VolunteerTabsSection from "@/components/volunteers/VolunteerTabsSection";
import { buildMetadata } from "@/lib/seo";
import { getCachedVolunteerCards } from "@/lib/cache/publicData";

export const metadata = buildMetadata({
  title: "Programa de Voluntários",
  description:
    "Conecte voluntários a abrigos e lares temporários e encontre perfis preparados para ajudar.",
  canonical: "/programa-de-voluntarios",
});

export default async function Page() {
  const volunteers = await getCachedVolunteerCards();

  return (
    <main>
      <PageHeader
        title="Programa de Voluntários"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Voluntários", href: "/programa-de-voluntarios" },
        ]}
      />

      <VolunteerTabsSection initialVolunteers={volunteers} />
    </main>
  );
}
