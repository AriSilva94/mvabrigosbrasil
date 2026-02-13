import type { JSX } from "react";

import Image from "next/image";
import { Text } from "@/components/ui/typography";
import ProjectLinksList from "@/components/institutional/ProjectLinksList";
import { PROJECT_LINKS } from "@/constants/projectLinks";

export default function ShelterMedicineSection(): JSX.Element {
  return (
    <section aria-labelledby="shelter-medicine-title" className="bg-white">
      <div className="container px-6 py-12">
        <article className="mx-auto max-w-4xl space-y-6 text-base leading-relaxed text-slate-600">
          <header>
            <Text
              id="shelter-medicine-title"
              className="font-22 font-bold text-text-default"
            >
              O que é a medicina veterinária de abrigos?
            </Text>
          </header>

          <p className="text-base font-normal">
            A Medicina de Abrigos (MA) é o conhecimento aplicado da medicina
            veterinária ao estudo dos fatores que influenciam a manutenção de
            animais no coletivo para promover a melhor qualidade de vida de
            animais abrigados ou institucionalizados. É a área dedicada a cuidar
            de animais abandonados e encontrar novos lares para eles. Combina
            estratégias e princípios dos cuidados da saúde individual com as
            necessidades da população, tendo, portanto, enfoque na manutenção da
            saúde da população. As recomendações em medicina de abrigos podem
            diferir da prática privada devido às considerações para toda a
            população e não individualmente. A MA é uma área da medicina
            veterinária do coletivo (MVC) – Especialidade da Medicina
            Veterinária reconhecida pelo Conselho Federal de Medicina
            Veterinária em 2021 – que está em ascensão no Brasil, que tem como
            objetivo promover o manejo populacional de cães e gatos em áreas
            urbanas (MPCG), sustentável e ético, e promover a reabilitação e
            ressocialização dos animais abandonados para que sejam
            reintroduzidos na sociedade por meio da adoção responsável.
          </p>

          <figure className="overflow-hidden rounded-3xl">
            <Image
              src="/assets/img/medicina-de-abrigos.jpg"
              alt="Profissionais apresentando estrutura para animais em abrigo"
              width={870}
              height={459}
              priority
              className="h-auto w-full object-cover"
              sizes="(max-width: 870px) 100vw, 870px"
            />
          </figure>

          <p className="text-base font-normal">
            Abrigos são locais que reúnem animais em um espaço delimitado, seja
            para a proteção dos animais, seja para a proteção dos seres humanos
            e para a vigilância epidemiológica das doenças, e que podem ser
            classificados em públicos, privados e mistos.
          </p>
          <p className="text-base font-normal">
            Podemos dividir em duas grandes áreas: políticas externas,
            relacionadas com as estratégias para o MPCG existentes no território
            e que impactam diretamente o abrigo; políticas internas, demandadas
            para a promoção da gestão e bons níveis de bem-estar dos animais
            abrigados, diminuição do tempo de manutenção e adoções monitoradas.
          </p>
          <p className="text-base font-normal">
            Os abrigos devem funcionar como casas de passagem, aplicando os 4 Rs
            dos programas de MPCG: resgate seletivo, recuperação,
            ressocialização e reintrodução na sociedade. Esses objetivos serão
            alcançados se o abrigo tiver políticas internas rígidas,
            implementadas ao longo do tempo com o conhecimento do histórico das
            doenças, com estrutura física adequada, recursos humanos capacitados
            e investimento nas ações preventivas e na promoção da adoção.
          </p>
          <p className="text-base font-normal">
            Entenda a diferença da Medicina de Abrigos e a Clínica Veterinária
            tradicional na lâmina abaixo confeccionadas pelo Projeto Medicina
            Veterinária de Abrigos do Instituto PremieRpet e a Universidade
            Federal do Paraná:
          </p>

          <ProjectLinksList links={PROJECT_LINKS} className="mt-10" />
        </article>
      </div>
    </section>
  );
}
