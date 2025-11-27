import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { TeamMembersSection } from "@/components/institutional/team";

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
