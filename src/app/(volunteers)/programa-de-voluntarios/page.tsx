import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
import VolunteerTabsSection from "@/components/volunteers/VolunteerTabsSection";
import { Heading, Text } from "@/components/ui/typography";

export default function Page() {
  return (
    <main>
      <PageHeader
        title="Programa de Voluntários"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Voluntários", href: "/programa-de-voluntarios" },
        ]}
      />

      <section className="flex items-center justify-center px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-3xl px-6 py-10 md:px-10">
          <Heading
            as="h2"
            className="text-[22px] font-semibold text-[#68707b] md:text-[24px]"
          >
            O que é o Programa de Voluntários?
          </Heading>

          <div className="mt-4 space-y-4 text-base leading-relaxed text-[#68707b]">
            <Text className="text-inherit">
              Esse programa visa conectar pessoas interessadas em atuar como
              voluntários em abrigos de animais/lares temporários com essas
              organizações de duas formas:
            </Text>

            <ol className="list-decimal space-y-3 pl-6">
              <li>
                Lista de voluntários criada a partir do cadastro de voluntários
                e disponibilizada abaixo, que possibilita que os abrigos/lares
                temporários tenham acesso ao perfil do voluntário disponível,
                podendo encontrar aquele que seja compatível com sua
                necessidade;
              </li>
              <li>
                Divulgação de vagas para voluntariado disponibilizado pelos
                abrigos/lares temporários cadastrados no site, permitindo que
                voluntários encontrem possibilidades de atuação do seu
                interesse.
              </li>
            </ol>

            <Text className="text-inherit">
              Cadastre-se e faça parte desse programa!
            </Text>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="https://mvabrigosbrasil.com.br/register/?tipo=voluntario"
              className="inline-flex items-center rounded-full bg-[#a3a74b] px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3a74b]"
            >
              Preciso de um voluntário
            </Link>
            <Link
              href="https://mvabrigosbrasil.com.br/register/?tipo=voluntario"
              className="inline-flex items-center rounded-full bg-brand-primary px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Quero ser um voluntário
            </Link>
          </div>
        </div>
      </section>

      <VolunteerTabsSection />
    </main>
  );
}
