import type { JSX } from "react";
import { BarChart3, FileText, UserCheck2 } from "lucide-react";

import IconLink from "@/components/ui/IconLink";
import { Heading, Text } from "@/components/ui/typography";
import type { ProjectLink } from "@/types/who-we-are.types";

const PROJECT_LINKS: ProjectLink[] = [
  {
    label: "Banco de Dados",
    href: "/banco-de-dados",
    icon: BarChart3,
  },
  {
    label: "Cadastre-se",
    href: "/login",
    icon: UserCheck2,
  },
  {
    label: "Biblioteca",
    href: "/biblioteca",
    icon: FileText,
  },
];

export default function WhoWeAreJustificationSection(): JSX.Element {
  return (
    <section className="bg-white pb-20 pt-10 md:pb-24 md:pt-12">
      <div className="container px-6">
        <article className="mx-auto max-w-4xl space-y-4 text-color-secondary">
          <Heading as="h2" className="font-28 text-brand-primary">
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

        <div className="mt-10 flex flex-wrap justify-center gap-4 text-brand-primary">
          {PROJECT_LINKS.map(({ label, href, icon }) => (
            <IconLink
              key={href}
              href={href}
              icon={icon}
              className="rounded-full bg-brand-primary/5 px-4 py-2 font-semibold transition hover:bg-brand-primary/10"
              iconSize={20}
            >
              {label}
            </IconLink>
          ))}
        </div>
      </div>
    </section>
  );
}
