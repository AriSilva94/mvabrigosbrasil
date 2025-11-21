"use client";

import Link from "next/link";
import { AlertTriangle, Home, Mail, RefreshCcw } from "lucide-react";

import ButtonLink from "@/components/ui/ButtonLink";
import { Heading, Text } from "@/components/ui/typography";

export default function ErrorPage() {
  return (
    <main
      className="relative overflow-hidden bg-brand-primary text-white"
      style={{
        backgroundImage: "url('/assets/img/bg_paws.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "inherit",
      }}
    >
      <section className="container px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <Heading as="h1" className="font-45 text-white">
              Algo não saiu como esperado
            </Heading>
            <Text className="max-w-2xl text-lg text-white/85">
              Sentimos muito! Um erro inesperado aconteceu. Você pode tentar
              novamente, voltar para a página inicial ou falar com nossa equipe.
            </Text>

            <div className="flex flex-wrap gap-3">
              <ButtonLink
                href="/"
                className="border-white bg-white text-brand-primary shadow-lg shadow-black/10 hover:bg-white/90"
              >
                <Home size={16} className="mr-2" aria-hidden />
                Voltar para a página inicial
              </ButtonLink>
              <Link
                href="/contato"
                className="btn-sample-y shadow-md shadow-brand-accent/30"
              >
                <Mail size={16} className="mr-2" aria-hidden />
                Falar com a equipe
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 p-8 text-brand-primary shadow-2xl ring-1 ring-brand-primary/10 backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl" />

              <div className="relative flex flex-col gap-4 text-brand-primary">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-brand-primary/10 p-3 text-brand-primary">
                      <AlertTriangle size={24} />
                    </span>
                    <Heading as="h2" className="text-2xl">
                      Precisa de ajuda?
                    </Heading>
                  </div>
                </div>

                <Text className="text-base text-slate-700">
                  Use os botões para recarregar, voltar para o início ou abrir o
                  canal de contato. Nossa equipe está pronta para apoiar.
                </Text>

                <div className="grid gap-3">
                  <div className="rounded-2xl bg-brand-primary/5 p-4 text-sm text-slate-700">
                    <p className="font-600 text-brand-primary">
                      Tentar recarregar
                    </p>
                    <p className="mt-1">
                      Clique em &quot;Tentar novamente&quot; para recarregar a
                      página com segurança.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-brand-primary/30 p-4 text-sm text-slate-700">
                    <p className="font-600 text-brand-primary">Rotas úteis</p>
                    <p className="mt-1">
                      Volte para a página inicial ou acesse o menu superior para
                      navegar para Biblioteca, Banco de Dados ou Voluntariado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
