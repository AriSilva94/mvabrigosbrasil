import type { JSX } from "react";

import AppImage from "@/components/ui/AppImage";
import { Heading, Text } from "@/components/ui/typography";

export default function WhoWeAreHeroSection(): JSX.Element {
  return (
    <section className="flex justify-center items-center bg-white pt-16">
      <div className="max-w-5xl px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="flex justify-center md:justify-end">
            <article className="space-y-6 text-color-secondary">
              <Heading as="h2" className="font-22 text-text-default">
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
          </div>

          <div className="flex justify-center md:justify-center">
            <AppImage
              src="/assets/img/about-us/img-quem-somos.png"
              alt="Equipe de pesquisadores da Medicina de Abrigos Brasil"
              width={300}
              height={300}
              className="h-auto w-full max-w-[440px] rounded-2xl object-cover shadow-lg"
              sizes="(max-width: 768px) 100vw, 480px"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
