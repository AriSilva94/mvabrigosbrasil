import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { Heading, Text } from "@/components/ui/typography";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Compromisso de Privacidade"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Compromisso de Privacidade" }]}
      />

      <LegalPageLayout activePath="/compromisso-privacidade">
        <Heading as="h2" className="text-2xl font-semibold text-brand-primary">
          Compromisso de Privacidade
        </Heading>
        <Text className="leading-relaxed">
          Em breve publicaremos o compromisso de privacidade atualizado, reforçando os princípios e
          responsabilidades do Medicina de Abrigos Brasil na proteção de dados pessoais.
        </Text>
      </LegalPageLayout>
    </main>
  );
}
