import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { Heading, Text } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contrato para Dados de Abrigo",
  description:
    "Termos de participação para abrigos e protetores que enviam informações à base nacional do projeto.",
  canonical: "/contrato-para-dados-de-abrigo",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Contrato de Participação"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Contrato para Dados de Abrigo" },
        ]}
      />

      <LegalPageLayout activePath="/contrato-para-dados-de-abrigo">
        <section className="space-y-4">
          <Heading as="h2" className="text-2xl font-semibold text-brand-primary">
            Medicina de Abrigos Brasil – Contrato para Dados de Abrigo
          </Heading>
          <Text className="leading-relaxed">
            A Medicina de Abrigos Brasil (“MAB”) mantém um banco de dados de abrigos de animais (o
            “Banco de Dados”), em um esforço para criar um banco de dados nacional. Quando um
            abrigo/protetor independente (Ab/PI) fornece informações para o Banco de Dados, elas são
            fornecidas e usadas nos seguintes termos:
          </Text>
        </section>

        <section className="space-y-3">
          <ol className="list-decimal space-y-3 pl-5 leading-relaxed">
            <li>
              O Ab/PI concorda em enviar dados completos para o portal de matriz de dados do MAB a
              cada mês.
            </li>
            <li>
              <strong>Permissão para usar as informações.</strong> O MAB tem permissão para usar
              qualquer Informação enviada pelo Ab/PI ao MAB no Banco de Dados sem custo para o MAB.
              Essa permissão é não exclusiva, mundial, isenta de royalties e permanente, permitindo
              que o Ab/PI conceda a terceiros o uso das Informações; a Base de Dados pode ser
              utilizada em qualquer lugar e sem limite de tempo; o MAB não paga royalties pelo uso
              das Informações.
            </li>
            <li>
              <strong>Usos permitidos de Informações.</strong> O MAB pode compilar as Informações com
              dados de outras organizações para apoiar o desenvolvimento de um banco de dados
              nacional. Pode disponibilizar os dados ao público no site ou em formato CSV, incluir as
              Informações em projetos de análise e divulgar, publicar ou apresentar resultados para
              qualquer finalidade legal relacionada à iniciativa, inclusive para potenciais
              financiadores. O MAB não pode divulgar, distribuir, apresentar ou publicar de forma que
              revele a identidade de qualquer animal ou pessoa associada.
            </li>
            <li>
              <strong>O Ab/PI é proprietário das Informações.</strong> Não há transferência de
              propriedade das Informações para o MAB, e estes Termos de Uso não limitam a propriedade
              do Ab/PI. Todos os direitos não concedidos ao MAB permanecem com o Ab/PI.
            </li>
            <li>
              <strong>Representações do Ab/PI e da MAB.</strong> O Ab/PI declara que as Informações
              são precisas e que não há limitações ao compartilhamento. O Ab/PI concorda com os
              TERMOS DE USO E POLÍTICA DE PRIVACIDADE do MAB.
            </li>
          </ol>
        </section>
      </LegalPageLayout>
    </main>
  );
}
