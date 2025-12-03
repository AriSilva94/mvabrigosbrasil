import type { JSX } from "react";

import AppImage from "@/components/ui/AppImage";
import { Heading, Text } from "@/components/ui/typography";

const PROJECT_OBJECTIVES = [
  "Mapear e ser um banco de dados nacional da dinâmica populacional dos cães e gatos de abrigos públicos, privados, mistos e protetores independentes/lares temporários.",
  "Difundir a Ciência da Medicina Veterinária de Abrigos, permitindo o acesso às pesquisas e literaturas acerca do tema e dar subsídios para colaboradores e profissionais atuantes fornecerem maior qualidade de vida aos animais, além de prevenir e combater o abandono.",
  "Permitir a interação entre abrigos e voluntários.",
] as const;

export default function WhoWeAreMissionSection(): JSX.Element {
  return (
    <section className="flex justify-center items-center bg-white pt-10">
      <div className="max-w-5xl px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="flex justify-center md:justify-start">
            <AppImage
              src="/assets/img/about-us/quemsomos3.png"
              alt="Profissional cuidando de cachorro em abrigo"
              width={300}
              height={300}
              className="h-auto w-full max-w-[420px] rounded-2xl object-cover shadow-lg"
              sizes="(max-width: 768px) 100vw, 460px"
            />
          </div>

          <article className="space-y-6 text-color-secondary">
            <div className="space-y-3">
              <Heading as="h2" className="font-22 text-text-default">
                Missão
              </Heading>
              <Text>
                Nossa missão é promover a ciência da medicina de abrigos no
                Brasil e ser um banco de dados nacional centralizado e
                padronizado para estatísticas de abrigos de animais.
              </Text>
            </div>

            <div className="space-y-3">
              <Heading as="h2" className="font-22 text-text-default">
                Como funciona o projeto?
              </Heading>
              <Text>A iniciativa tem três objetivos:</Text>
              <ol className="space-y-3 text-base leading-relaxed">
                {PROJECT_OBJECTIVES.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ol>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
