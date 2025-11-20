import type { JSX } from "react";
import Image from "next/image";
import Link from "next/link";

import { Heading, Text } from "@/components/ui/typography";

type LibraryItem = {
  title: string;
  category: string;
  imageSrc: string;
  href: string;
};

const LIBRARY_ITEMS: LibraryItem[] = [
  {
    title:
      "The Association of Shelter Veterinarians’ Guidelines for Humane Rabbit Housing in Animal Shelters",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/the-association-of-shelter-veterinarians-guidelines-for-humane-rabbit-housing-in-animal-shelters.jpg",
    href: "#",
  },
  {
    title: "Lamina Função e Papel Abrigos – Projeto MVA",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/lamina-funcao-e-papel-abrigos-projeto-mva.jpg",
    href: "#",
  },
  {
    title:
      "Recursos Humanos em Abrigos de Cães e Gatos: Parâmetros Técnicos para Dimensionamento de Equipes de Médicos Veterinários e Tratadores",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/recursos-humanos-em-abrigos-de-caes-e-gatos-parametros-tecnicos-para-dimensionamento-de-equipes-de-medicos-veterinarios-e-tratadores.jpg",
    href: "#",
  },
  {
    title: "Diretrizes de RT e Manejo",
    category: "Informativos Técnicos",
    imageSrc: "/assets/img/library/diretrizes-de-rt-e-manejo.jpg",
    href: "#",
  },
];

export default function LibrarySection(): JSX.Element {
  return (
    <section
      className="bg-white py-16 md:py-24"
      aria-labelledby="library-title"
    >
      <div className="container px-6">
        <header className="text-center">
          <Heading
            as="h2"
            id="library-title"
            className="font-34 text-brand-primary"
          >
            Biblioteca do Medicina de Abrigos Brasil
          </Heading>
        </header>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {LIBRARY_ITEMS.map(({ title, category, imageSrc, href }, index) => (
            <article
              key={index}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <Link href={href} target="_blank" rel="noreferrer">
                <Image
                  src={imageSrc}
                  alt={title}
                  width={600}
                  height={840}
                  className="h-full w-full object-contain"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                <span className="text-sm font-semibold text-brand-primary">
                  {category}
                </span>
                <Text className="font-20 leading-snug text-brand-secondary">
                  {title}
                </Text>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="https://mvabrigosbrasil.com.br/biblioteca"
            className="btn-sample"
            target="_blank"
            rel="noreferrer"
          >
            Ir para Biblioteca
          </Link>
        </div>
      </div>
    </section>
  );
}
