import type { JSX } from "react";

import AppImage from "@/components/ui/AppImage";
import { Heading, Text } from "@/components/ui/typography";

export default function WhoWeAreHeroSection(): JSX.Element {
  return (
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
              ao Departamento de Medicina Veterinária da Universidade Federal do
              Paraná financiada pela Fundação Araucária, Superintendência Geral
              de Ciência, Tecnologia e Ensino Superior (SETI) e Secretaria de
              Estado do Desenvolvimento Sustentável e do Turismo do Paraná
              (SEDEST).
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
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
