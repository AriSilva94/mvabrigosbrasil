import type { JSX } from "react";
import Link from "next/link";
import { BadgeCheck, UserCheck2, Video } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import { PANEL_SHORTCUTS, TRAINING_URL } from "@/constants/panel";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess, filterPanelShortcuts } from "@/lib/auth/teamAccess";
import type { PanelShortcut } from "@/types/panel.types";

export const metadata = buildMetadata({
  title: "Painel",
  description:
    "Área logada do projeto para acompanhar atalhos, treinamentos e recursos de abrigos ou voluntários.",
  canonical: "/painel",
});

const VOLUNTEER_SHORTCUTS = [
  {
    id: "vacancies",
    title: "Vagas Disponiveis",
    href: "/programa-de-voluntarios",
    icon: BadgeCheck,
  },
  {
    id: "trainings",
    title: "Treinamentos",
    href: TRAINING_URL,
    icon: Video,
  },
  {
    id: "profile",
    title: "Meu Cadastro",
    href: "/meu-cadastro",
    icon: UserCheck2,
  },
] as const;

function VolunteerPanel(): JSX.Element {
  return (
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
          <ul className="grid gap-5 grid-cols-1 md:grid-cols-3">
            {VOLUNTEER_SHORTCUTS.map(({ id, title, href, icon: Icon }) => (
              <li key={id}>
                <Link
                  href={href}
                  className="group flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#f5f5f6] px-8 py-10 text-center transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(16,130,89,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <Icon
                    className="h-12 w-12 text-brand-primary transition group-hover:scale-105"
                    aria-hidden
                  />
                  <Heading
                    as="h3"
                    className="mt-4 text-[20px] font-semibold text-[#555a6d]"
                  >
                    {title}
                  </Heading>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

function ShelterPanel({
  shortcuts,
  isTeamDisabled,
}: {
  shortcuts: ReadonlyArray<PanelShortcut>;
  isTeamDisabled: boolean;
}): JSX.Element {
  return (
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
          {isTeamDisabled ? (
            <span className="inline-flex w-full justify-center rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 md:w-auto cursor-not-allowed">
              Treinamento indisponível
            </span>
          ) : (
            <Link
              href={TRAINING_URL}
              className="btn-sample inline-flex w-full justify-center bg-brand-primary px-4 py-2 text-sm font-semibold md:w-auto"
            >
              Assistir Treinamento
            </Link>
          )}
        </article>

        <section className="mt-10">
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shortcuts.map(({ id, title, subtitle, href, icon: Icon }) => (
              <li key={id}>
                {isTeamDisabled ? (
                  <div
                    aria-disabled="true"
                    className="group flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#f5f5f6] px-6 py-10 text-center opacity-60 cursor-not-allowed"
                  >
                    <Icon
                      className="h-12 w-12 text-brand-primary"
                      aria-hidden
                    />
                    <Heading
                      as="h3"
                      className="mt-4 text-[20px] font-semibold text-[#555a6d]"
                    >
                      {title}
                    </Heading>
                    <Text className="mt-1 text-sm text-[#7b8191]">
                {subtitle}
              </Text>
              <Text className="mt-3 text-xs font-semibold text-[#9ba1ad] cursor-not-allowed">
                Acesso inativo
              </Text>
            </div>
                ) : (
                  <Link
                    href={href}
                    className="group flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#f5f5f6] px-6 py-10 text-center transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(16,130,89,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    <Icon
                      className="h-12 w-12 text-brand-primary transition group-hover:scale-105"
                      aria-hidden
                    />
                    <Heading
                      as="h3"
                      className="mt-4 text-[20px] font-semibold text-[#555a6d]"
                    >
                      {title}
                    </Heading>
                    <Text className="mt-1 text-sm text-[#7b8191]">
                      {subtitle}
                    </Text>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

export default async function Page(): Promise<JSX.Element> {
  const access = await enforceTeamAccess("/painel");
  const isVolunteer = access.registerType === REGISTER_TYPES.volunteer;
  const shortcuts = filterPanelShortcuts(PANEL_SHORTCUTS, access.isTeamOnly);

  const isTeamOnly = access.isTeamOnly;
  const isTeamDisabled = access.isTeamDisabled;

  return (
    <main>
      <PageHeader
        title="Painel"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Painel" }]}
      />

      {isTeamOnly && (
        <section className="bg-white">
          <div className="container px-6 pt-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              {isTeamDisabled
                ? "Acesso de equipe inativo. Entre em contato com o responsável para reativar."
                : "Acesso limitado para equipe: apenas o registro de Dinâmica Populacional está disponível."}
            </div>
          </div>
        </section>
      )}

      {isVolunteer ? (
        <VolunteerPanel />
      ) : (
        <ShelterPanel shortcuts={shortcuts} isTeamDisabled={isTeamDisabled} />
      )}
    </main>
  );
}
