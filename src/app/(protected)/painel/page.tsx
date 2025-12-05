import type { JSX } from "react";
import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import { PANEL_SHORTCUTS, TRAINING_URL } from "@/constants/panel";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Painel"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Painel" }]}
      />

      <section className="bg-white">
        <div className="container px-6 py-14">
          <article
            className="flex flex-col gap-3 rounded-xl border border-[#f2e5b9] bg-[#fff7d5] px-5 py-4 text-[#6f6133] shadow-sm md:flex-row md:items-center md:justify-between"
            role="alert"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Novo por aqui?{" "}
                <span className="font-normal">
                  Veja como funciona a plataforma.
                </span>
              </p>
            </div>
            <Link
              href={TRAINING_URL}
              className="btn-sample inline-flex w-full justify-center bg-brand-primary px-4 py-2 text-sm font-semibold md:w-auto"
            >
              Assistir Treinamento
            </Link>
          </article>

          <section className="mt-10">
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {PANEL_SHORTCUTS.map(({ id, title, subtitle, href, icon: Icon }) => (
                <li key={id}>
                  <Link
                    href={href}
                    className="group flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#f5f5f6] px-6 py-10 text-center transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(16,130,89,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    <Icon className="h-12 w-12 text-brand-primary transition group-hover:scale-105" aria-hidden />
                    <Heading
                      as="h3"
                      className="mt-4 text-[20px] font-semibold text-[#555a6d]"
                    >
                      {title}
                    </Heading>
                    <Text className="mt-1 text-sm text-[#7b8191]">{subtitle}</Text>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
