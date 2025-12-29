import type { JSX } from "react";

import AppImage from "@/components/ui/AppImage";
import ButtonLink from "@/components/ui/ButtonLink";
import { Heading, Text } from "@/components/ui/typography";
import type { CtaLink } from "@/types/home.types";

const CTA_LINKS: CtaLink[] = [
  {
    label: "Cadastro Voluntário",
    href: "/register?tipo=voluntario",
    variant: "secondary",
  },
  {
    label: "Cadastro Abrigo",
    href: "/register?tipo=abrigo",
  },
];

export default function HeroSection(): JSX.Element {
  return (
    <section className="intro relative isolate overflow-hidden bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.55)_100%)] min-h-[calc(100vh-140px)]">
      <AppImage
        src="/assets/img/bg_intro.jpg"
        alt="Plano de fundo de animais"
        fill
        quality={85}
        priority
        sizes="100vw"
        className="-z-10 object-cover"
        style={{ contentVisibility: "auto" }}
      />
      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-6xl flex-col items-center justify-center px-6 text-center text-white md:px-8">
        <Heading as="h1" className="font-45 md:max-w-11/12">
          Mapeamento e Banco de Dados de Abrigos de Animais no Brasil
        </Heading>
        <Text className="mt-4 max-w-2xl text-white md:text-lg">
          Os registros dos dados também ajudam a salvar vidas! <br /> Faça parte
          desse movimento
        </Text>
        <div className="mt-8 flex flex-col items-center gap-3 md:flex-row">
          {CTA_LINKS.map(({ label, href, variant }) => (
            <ButtonLink key={href} href={href} variant={variant}>
              {label}
            </ButtonLink>
          ))}
        </div>
      </div>
    </section>
  );
}
