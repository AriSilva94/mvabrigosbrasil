import type { JSX } from "react";

import ProjectLinksList from "@/components/institutional/ProjectLinksList";
import { Heading, Text } from "@/components/ui/typography";
import { PROJECT_LINKS } from "@/constants/projectLinks";

export default function WhoWeAreJustificationSection(): JSX.Element {
  return (
    <section className="flex justify-center items-center bg-white pb-20 pt-10 md:pb-24 md:pt-12">
      <div className="max-w-5xl px-6">
        <article className="mx-auto max-w-4xl space-y-4 text-color-secondary">
          <Heading as="h2" className="font-22 text-text-default">
            Justificativa
          </Heading>
          <Text>
            A Medicina de Abrigos Brasil – Infodados de Abrigos de Animais surge
            como uma forma de suprir a necessidade de promover a ciência da
            Medicina de abrigos no país, e obter dados representativos com base
            em estatísticas nacionais para o desenvolvimento de políticas
            públicas que reduzam o abandono de animais de estimação e promovam a
            adoção. Dessa forma, será possível garantir melhores práticas nesses
            ambientes; realizar o monitoramento contínuo do número de admissões
            e saídas de cães e gatos em abrigos; fornecer às organizações de
            animais informações necessárias que possam agilizar e dinamizar as
            operações de acordo com as necessidades de sua comunidade; avaliar
            resultados das estratégias de manejo existentes de cães e gatos
            abandonados e que estão em situação de rua; e facilitar a alocação
            eficaz de recursos do governo e em organizações de bem-estar animal.
          </Text>
        </article>

        <ProjectLinksList links={PROJECT_LINKS} className="mt-10" />
      </div>
    </section>
  );
}
