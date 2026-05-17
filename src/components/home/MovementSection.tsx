import type { JSX } from "react";
import Link from "next/link";
import { Home, UserCheck2 } from "lucide-react";

import { Heading, Text } from "@/components/ui/typography";
import PawsBackgroundSection from "@/components/ui/PawsBackgroundSection";

export default function MovementSection(): JSX.Element {
  return (
    <PawsBackgroundSection aria-labelledby="movimento-title">
      <div className="container px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-start">
          <article className="flex flex-col items-center text-center md:border-r md:border-white/30 md:pr-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <Home className="h-10 w-10 text-white" aria-hidden />
            </div>
            <Heading
              as="h2"
              id="movimento-title"
              className="mt-6 text-2xl leading-tight md:text-[28px]"
            >
              Faça parte desse movimento:
              <br />
              compartilhe os dados do seu abrigo.
              <br />
              Cadastre-se aqui!
            </Heading>
            <Link
              href="https://mvabrigosbrasil.com.br/register/?tipo=abrigo"
              className="btn-sample-y mt-6"
            >
              Cadastre seu Abrigo
            </Link>
            <Text className="mt-6 text-white/90">Tem dúvidas?</Text>
            <Link
              href="https://mvabrigosbrasil.com.br/como-funciona-o-cadastro-de-abrigos"
              className="text-white underline-offset-4 hover:underline"
            >
              Veja as Perguntas Frequentes
            </Link>
          </article>

          <article className="flex flex-col items-center text-center md:pl-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <UserCheck2 className="h-10 w-10 text-white" aria-hidden />
            </div>
            <Heading
              as="h2"
              className="mt-6 text-2xl leading-tight md:text-[28px]"
            >
              Participe do programa de voluntários!
              <br />
              Cadastre-se aqui!
            </Heading>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="https://mvabrigosbrasil.com.br/register/?tipo=voluntario"
                className="btn-sample-y"
              >
                Preciso de Voluntário
              </Link>
              <Link
                href="https://mvabrigosbrasil.com.br/register/?tipo=voluntario"
                className="btn-sample-y"
              >
                Quero ser Voluntário
              </Link>
            </div>
          </article>
        </div>
      </div>
    </PawsBackgroundSection>
  );
}
