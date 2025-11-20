import Link from "next/link";
import { ArrowLeft, BookOpen, LifeBuoy, MapPin, PawPrint } from "lucide-react";

import ButtonLink from "@/components/ui/ButtonLink";
import { Heading, Text } from "@/components/ui/typography";

const QUICK_LINKS = [
  {
    href: "/banco-de-dados",
    label: "Mapa e Banco de Dados",
    description: "Acesse os abrigos cadastrados e estatísticas atualizadas.",
    icon: MapPin,
  },
  {
    href: "/biblioteca",
    label: "Biblioteca Técnica",
    description: "Encontre materiais e guias para apoiar sua gestão.",
    icon: BookOpen,
  },
  {
    href: "/contato",
    label: "Fale com a Equipe",
    description: "Precisa de ajuda? Estamos prontos para orientar você.",
    icon: LifeBuoy,
  },
];

export default function NotFound() {
  return (
    <main
      className="relative overflow-hidden bg-brand-primary text-white"
      style={{
        backgroundImage: "url('/assets/img/bg_paws.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "inherit",
      }}
    >
      <section className="container relative px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <Heading as="h1" className="font-45 text-white">
              Não encontramos a página que você procura
            </Heading>
            <Text className="max-w-2xl text-lg text-white/85">
              O caminho seguido pode ter mudado ou não existe mais. Use os
              atalhos abaixo para continuar navegando pelos conteúdos do
              Medicina de Abrigos Brasil.
            </Text>

            <div className="flex flex-wrap gap-3">
              <ButtonLink
                href="/"
                className="border-white bg-white text-brand-primary shadow-lg shadow-black/10 hover:bg-white/90"
              >
                Voltar para a página inicial
              </ButtonLink>
              <Link
                href="/contato"
                className="btn-sample-y shadow-md shadow-brand-accent/30"
              >
                Falar com a equipe
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-2xl bg-white/95 p-4 text-brand-primary shadow-md ring-1 ring-brand-primary/10 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-brand-primary/20 backdrop-blur"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white">
                    <Icon size={18} />
                  </div>
                  <p className="mt-3 font-600">{label}</p>
                  <p className="mt-1 text-sm text-slate-700">{description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 p-8 text-brand-primary shadow-2xl ring-1 ring-brand-primary/10 backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl" />

              <div className="relative flex flex-col gap-4 text-brand-primary">
                <div className="flex items-start justify-between">
                  <Heading
                    as="h2"
                    className="font-50 leading-none text-brand-accent"
                  >
                    404
                  </Heading>
                  <span className="rounded-full bg-brand-primary/10 p-3 text-brand-primary">
                    <PawPrint size={24} />
                  </span>
                </div>

                <Text className="text-base text-slate-700">
                  Seguimos cuidando para que os caminhos da plataforma sejam
                  claros. Enquanto isso, veja como podemos ajudar você a
                  continuar sua navegação.
                </Text>

                <div className="grid gap-3">
                  <div className="rounded-2xl bg-brand-primary/5 p-4 text-sm text-slate-700">
                    <p className="font-600 text-brand-primary">
                      Precisa de orientação?
                    </p>
                    <p className="mt-1">
                      Envie sua dúvida pelo contato ou fale com nossa equipe de
                      voluntários. Estamos aqui para apoiar a sua missão.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-brand-primary/30 p-4 text-sm text-slate-700">
                    <p className="font-600 text-brand-primary">Dica rápida</p>
                    <p className="mt-1">
                      Use o menu superior para acessar áreas como Biblioteca,
                      Banco de Dados ou Programas de Voluntariado.
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
