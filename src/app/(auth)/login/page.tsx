import { Fragment, type JSX } from "react";
import { PlayCircle } from "lucide-react";
import Link from "next/link";

import LoginForm from "@/components/auth/LoginForm";
import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import { LOGIN_TUTORIALS, REGISTER_OPTIONS } from "@/constants/login";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Acessar",
  description:
    "Entre com sua conta de abrigo ou voluntário para atualizar dados, publicar vagas e acessar conteúdos.",
  canonical: "/login",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Acessar"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Acessar" }]}
      />

      <section className="bg-white">
        <div className="container px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
            <article className="flex flex-col items-center text-center lg:items-start lg:text-left lg:pr-12">
              <header className="max-w-md space-y-2">
                <Heading
                  as="h2"
                  className="text-[26px] font-semibold leading-tight text-[#555a6d]"
                >
                  Entrar
                </Heading>
                <Text className="text-base text-[#7b8191]">
                  Preencha os dados para entrar no sistema.
                </Text>
              </header>

              <LoginForm />
            </article>

            <article className="flex flex-col items-center text-center lg:items-start lg:text-left lg:pl-12">
              <header className="max-w-md space-y-2">
                <Heading
                  as="h2"
                  className="text-[26px] font-semibold leading-tight text-[#555a6d]"
                >
                  Não tem cadastro?
                </Heading>
                <Text className="text-base text-[#7b8191]">
                  Escolha a melhor forma de se cadastrar.
                </Text>
              </header>

              <div className="mt-8 flex w-full max-w-md flex-col items-center gap-3 lg:items-start">
                {REGISTER_OPTIONS.map(({ id, label, href, variant }, index) => (
                  <Fragment key={id}>
                    <Link
                      href={href}
                      className={
                        variant === "secondary"
                          ? "btn-sample-lg bg-secondary px-8 py-3 text-sm font-semibold uppercase tracking-[0.02em]"
                          : "btn-sample-lg px-8 py-3 text-sm font-semibold uppercase tracking-[0.02em]"
                      }
                    >
                      {label}
                    </Link>
                    {index === 0 && (
                      <Text className="text-sm font-semibold text-[#7b8191]">
                        ou
                      </Text>
                    )}
                  </Fragment>
                ))}
              </div>

              <div className="mt-8 w-full max-w-md space-y-3 text-left">
                <Text className="text-base font-semibold text-[#7b8191]">
                  Veja nos tutoriais como é simples se cadastrar:
                </Text>
                <ul className="space-y-3">
                  {LOGIN_TUTORIALS.map(({ id, label, href }) => (
                    <li key={id}>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <PlayCircle className="h-5 w-5 text-brand-primary" aria-hidden />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
