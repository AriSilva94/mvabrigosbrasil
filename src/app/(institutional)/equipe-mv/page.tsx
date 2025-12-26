import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { TeamMembersSection } from "@/components/institutional/team";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Equipe",
  description:
    "Equipe multidisciplinar da Medicina de Abrigos Brasil dedicada ao mapeamento e apoio aos abrigos de animais.",
  canonical: "/equipe-mv",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Equipe"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Equipe" }]}
      />
      <TeamMembersSection />
    </main>
  );
}
