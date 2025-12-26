import type { JSX } from "react";
import Link from "next/link";
import { BadgeCheck, UserCheck2, Video } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import { PANEL_SHORTCUTS, TRAINING_URL } from "@/constants/panel";
import { REGISTER_TYPES, type RegisterType } from "@/constants/registerTypes";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";
import { buildMetadata } from "@/lib/seo";

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

async function loadUserPostType(): Promise<RegisterType | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  const supabaseAdmin = getSupabaseAdminClient();

  return resolvePostTypeForUser(supabaseAdmin, {
    supabaseUserId: data.user.id,
    email: data.user.email ?? null,
  });
}

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

function ShelterPanel(): JSX.Element {
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
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {PANEL_SHORTCUTS.map(
              ({ id, title, subtitle, href, icon: Icon }) => (
                <li key={id}>
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
                </li>
              )
            )}
          </ul>
        </section>
      </div>
    </section>
  );
}

export default async function Page(): Promise<JSX.Element> {
  const postType = await loadUserPostType();
  const isVolunteer = postType === REGISTER_TYPES.volunteer;

  return (
    <main>
      <PageHeader
        title="Painel"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Painel" }]}
      />

      {isVolunteer ? <VolunteerPanel /> : <ShelterPanel />}
    </main>
  );
}
