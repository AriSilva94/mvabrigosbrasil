import type { JSX } from "react";
import Link from "next/link";
import { BarChart3, FileText, UserCheck2 } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import AppImage from "@/components/ui/AppImage";
import IconLink from "@/components/ui/IconLink";
import { Heading, Text } from "@/components/ui/typography";

const PROJECT_LINKS = [
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

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Quem Somos"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Quem Somos" }]}
      />

      <section className="bg-white py-16 md:py-24">
        <div className="container px-6">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <article className="space-y-6 text-color-secondary">
              <Heading as="h2" className="font-32 text-brand-primary">
                Promovedores da Medicina de Abrigos
              </Heading>
              <Text>
                A Medicina de Abrigos Brasil - Infodados de Abrigos de Animais é
                uma iniciativa inovadora idealizada por pesquisadores vinculados
                ao Departamento de Medicina Veterinária da Universidade Federal
                do Paraná financiada pela Fundação Araucária, Superintendência
                Geral de Ciência, Tecnologia e Ensino Superior (SETI) e
                Secretaria de Estado do Desenvolvimento Sustentável e do Turismo
                do Paraná (SEDEST).
              </Text>
            </article>

            <div className="flex justify-center md:justify-end">
              <AppImage
                src="/assets/img/about-us/img-quem-somos.png"
                alt="Equipe de pesquisadores da Medicina de Abrigos Brasil"
                width={520}
                height={520}
                className="h-auto w-full max-w-[440px] rounded-2xl object-cover shadow-lg"
                sizes="(max-width: 768px) 100vw, 480px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container px-6">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="flex justify-center md:justify-start">
              <AppImage
                src="/assets/img/about-us/quemsomos3.png"
                alt="Profissional cuidando de cachorro em abrigo"
                width={520}
                height={520}
                className="h-auto w-full max-w-[420px] rounded-2xl object-cover shadow-lg"
                sizes="(max-width: 768px) 100vw, 460px"
              />
            </div>

            <article className="space-y-6 text-color-secondary">
              <div className="space-y-3">
                <Heading as="h2" className="font-28 text-brand-primary">
                  Missão
                </Heading>
                <Text>
                  Nossa missão é promover a ciência da medicina de abrigos no
                  Brasil e ser um banco de dados nacional centralizado e
                  padronizado para estatísticas de abrigos de animais.
                </Text>
              </div>

              <div className="space-y-3">
                <Heading as="h2" className="font-28 text-brand-primary">
                  Como funciona o projeto?
                </Heading>
                <Text>A iniciativa tem três objetivos:</Text>
                <ol className="space-y-3 text-base leading-relaxed">
                  <li>
                    Mapear e ser um banco de dados nacional da dinâmica
                    populacional dos cães e gatos de abrigos públicos, privados,
                    mistos e protetores independentes/lares temporários.
                  </li>
                  <li>
                    Difundir a Ciência da Medicina Veterinária de Abrigos,
                    permitindo o acesso às pesquisas e literaturas acerca do
                    tema e dar subsídios para colaboradores e profissionais
                    atuantes fornecerem maior qualidade de vida aos animais,
                    além de prevenir e combater o abandono.
                  </li>
                  <li>Permitir a interação entre abrigos e voluntários.</li>
                </ol>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 pt-10 md:pb-24 md:pt-12">
        <div className="container px-6">
          <article className="mx-auto max-w-4xl space-y-4 text-color-secondary">
            <Heading as="h2" className="font-28 text-brand-primary">
              Justificativa
            </Heading>
            <Text>
              A Medicina de Abrigos Brasil – Infodados de Abrigos de Animais
              surge como uma forma de suprir a necessidade de promover a ciência
              da Medicina de abrigos no país, e obter dados representativos com
              base em estatísticas nacionais para o desenvolvimento de políticas
              públicas que reduzam o abandono de animais de estimação e promovam
              a adoção. Dessa forma, será possível garantir melhores práticas
              nesses ambientes; realizar o monitoramento contínuo do número de
              admissões e saídas de cães e gatos em abrigos; fornecer às
              organizações de animais informações necessárias que possam
              agilizar e dinamizar as operações de acordo com as necessidades de
              sua comunidade; avaliar resultados das estratégias de manejo
              existentes de cães e gatos abandonados e que estão em situação de
              rua; e facilitar a alocação eficaz de recursos do governo e em
              organizações de bem-estar animal.
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
    </main>
  );
}
