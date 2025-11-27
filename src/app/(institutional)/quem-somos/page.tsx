import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import {
  WhoWeAreFoundersSection,
  WhoWeAreHeroSection,
  WhoWeAreJustificationSection,
  WhoWeAreMissionSection,
  WhoWeAreSupportersCtaSection,
} from "@/components/institutional/who-we-are";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Quem Somos"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Quem Somos" }]}
      />

      <WhoWeAreHeroSection />
      <WhoWeAreMissionSection />
      <WhoWeAreJustificationSection />
      <WhoWeAreFoundersSection />
      <WhoWeAreSupportersCtaSection />
    </main>
  );
}
