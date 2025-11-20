import type { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, Home, UserCheck2 } from "lucide-react";

import IconLink from "@/components/ui/IconLink";
import { Heading, Text } from "@/components/ui/typography";
import type { WelcomeLink } from "@/types/home.types";

const WELCOME_LINKS: WelcomeLink[] = [
  {
    label: "Quem Somos",
    href: "/quem-somos",
    icon: Home,
  },
  {
    label: "Banco de Dados",
    href: "/banco-de-dados",
    icon: BarChart3,
  },
  {
    label: "Entrar/Cadastrar",
    href: "/login",
    icon: UserCheck2,
  },
];

const WELCOME_PARAGRAPHS = [
  "A Medicina de Abrigos Brasil - Infodados de Abrigos de Animais é uma iniciativa para promover a ciência da medicina de abrigos no Brasil e ser um banco de dados nacional centralizado e padronizado para estatísticas de abrigos de animais.",
  "Dados representativos com base em estatísticas nacionais para o desenvolvimento de políticas públicas podem reduzir o abandono de animais de estimação e promover a adoção.",
  "Venha fazer parte desse movimento, se você é um abrigo/lar temporário colabore com o registro desses números, eles podem salvar e melhorar a vida dos animais!",
];

export default function WelcomeSection(): JSX.Element {
  return (
    <section className="bg-light py-16 md:py-24">
      <div className="container flex flex-col gap-10 px-6 md:flex-row md:items-center md:gap-12">
        <article className="md:w-1/2 space-y-4 text-color-secondary">
          <Text className="font-600 font-20 uppercase text-brand-accent tracking-[0.03em]">
            Boas Vindas
          </Text>
          <Heading as="h2" className="font-36 text-brand-primary">
            1ª iniciativa de mapeamento e coleta de dados dos abrigos de cães e
            gatos do Brasil
          </Heading>
          {WELCOME_PARAGRAPHS.map((paragraph) => (
            <Text key={paragraph}>{paragraph}</Text>
          ))}

          <ul className="mt-6 flex flex-wrap items-center gap-5 text-brand-primary">
            {WELCOME_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={href} className="flex items-center gap-2">
                <IconLink href={href} icon={Icon}>
                  {label}
                </IconLink>
              </li>
            ))}
          </ul>
        </article>

        <div className="md:w-1/2">
          <Link
            href="/quem-somos"
            className="block overflow-hidden rounded-2xl shadow-lg"
          >
            <Image
              src="/assets/img/sobre-mvabrigos.png"
              alt="Profissional cuidando de cachorro em abrigo"
              width={640}
              height={720}
              quality={85}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
