import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { Heading, Text } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Compromisso de Privacidade",
  description:
    "Nosso compromisso de privacidade reforça como protegemos dados pessoais e tratamos informações com responsabilidade.",
  canonical: "/compromisso-privacidade",
});

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
          A Medicina de Abrigos Brasil se compromete a tratar os dados pessoais para as finalidades
          informadas, limitar o acesso conforme as permissões de cada usuário e oferecer canais
          para dúvidas e solicitações sobre privacidade.
        </Text>
        <Text className="leading-relaxed">
          Adotamos medidas de segurança e controle de acesso para proteger as informações
          cadastradas. O uso e o compartilhamento dos dados seguem as finalidades informadas
          e as condições descritas em nossas políticas.
        </Text>
        <Text className="leading-relaxed">
          Os detalhes sobre o tratamento de dados pessoais estão na{" "}
          <a
            href="/politica-de-privacidade"
            className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
          >
            Política de Privacidade
          </a>
          . As preferências de cookies opcionais podem ser revistas no link
          &quot;Configurar cookies&quot; no rodapé do site.
        </Text>
        <Text className="text-sm leading-relaxed">Última atualização: 18/10/2026.</Text>
      </LegalPageLayout>
    </main>
  );
}
