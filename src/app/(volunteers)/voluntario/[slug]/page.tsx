import type { JSX } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import PageHeader from "@/components/layout/PageHeader";
import { Heading } from "@/components/ui/typography";
import { getVolunteerProfileBySlug } from "@/services/volunteersService";
import { buildMetadata } from "@/lib/seo";

interface VolunteerPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ from?: string }>;
}

export async function generateMetadata({
  params,
}: Pick<VolunteerPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getVolunteerProfileBySlug(slug);
  const displayName = profile?.name || "Perfil de voluntário";
  const location =
    profile?.city && profile?.state
      ? `${profile.city} - ${profile.state}`
      : profile?.city || profile?.state || null;
  const description = location
    ? `${displayName} disponível para apoiar abrigos em ${location}.`
    : `${displayName} disponível para apoiar abrigos e lares temporários.`;

  return buildMetadata({
    title: displayName,
    description,
    canonical: `/voluntario/${slug}`,
  });
}

export default async function Page({
  params,
  searchParams,
}: VolunteerPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const { from } = (await searchParams) ?? {};
  const profile = await getVolunteerProfileBySlug(slug);

  const cameFromProgram = from === "programa-de-voluntarios";
  const backHref = cameFromProgram ? "/programa-de-voluntarios" : "/voluntarios";
  const breadcrumbLabel = cameFromProgram
    ? "Programa de Voluntários"
    : "Voluntários";

  const displayName = profile?.name || "Perfil de voluntário";
  const location =
    profile?.city && profile?.state
      ? `${profile.city} - ${profile.state}`
      : profile?.city || profile?.state || "Não informado";

  return (
    <main>
      <PageHeader
        title="Perfil de Voluntário"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          {
            label: breadcrumbLabel,
            href: backHref,
          },
          { label: displayName },
        ]}
      />

      <section className="container px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link
            href={backHref}
            className="inline-flex items-center text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
          >
            ← Voltar
          </Link>

          <article className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 md:items-center">
                <div>
                  <Heading
                    as="h2"
                    className="text-lg font-semibold text-brand-primary"
                  >
                    Nome Social
                  </Heading>
                  <p className="mt-1 text-base text-[#68707b]">
                    {profile?.name ?? "Voluntário"}
                  </p>
                </div>
                <div className="md:text-right">
                  <Heading
                    as="h2"
                    className="text-lg font-semibold text-brand-primary"
                  >
                    Cidade/Estado
                  </Heading>
                  <p className="mt-1 text-base text-[#68707b]">{location}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Heading
                  as="h3"
                  className="text-base font-semibold text-brand-primary"
                >
                  Profissão
                </Heading>
                <p className="mt-1 text-base text-[#68707b]">
                  {profile?.profession || "Não informado"}
                </p>
              </div>
              <div>
                <Heading
                  as="h3"
                  className="text-base font-semibold text-brand-primary"
                >
                  Escolaridade
                </Heading>
                <p className="mt-1 text-base text-[#68707b]">
                  {profile?.schooling || "Não informado"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Heading
                  as="h3"
                  className="text-base font-semibold text-brand-primary"
                >
                  Experiente em trabalho voluntário
                </Heading>
                <p className="mt-1 text-base text-[#68707b]">
                  {profile?.experience || "Não informado"}
                </p>
              </div>
              <div>
                <Heading
                  as="h3"
                  className="text-base font-semibold text-brand-primary"
                >
                  Disponibilidade trabalho voluntário
                </Heading>
                <p className="mt-1 text-base text-[#68707b]">
                  {profile?.availability || "Não informado"}
                </p>
              </div>
            </div>

            <div>
              <Heading
                as="h3"
                className="text-base font-semibold text-brand-primary"
              >
                Habilidades
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {profile?.skills || "Não informado"}
              </p>
            </div>

            <div>
              <Heading
                as="h3"
                className="text-base font-semibold text-brand-primary"
              >
                Período
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {profile?.period || "Não informado"}
              </p>
            </div>

            <div>
              <Heading
                as="h3"
                className="text-base font-semibold text-brand-primary"
              >
                Observações
              </Heading>
              <p className="mt-1 text-base text-[#68707b]">
                {profile?.notes || "Não informado"}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="https://mvabrigosbrasil.com.br/register/?tipo=abrigo"
                className="inline-flex items-center rounded-full bg-[#a3a74b] px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3a74b]"
              >
                Preciso de um voluntário
              </Link>
              <Link
                href="https://mvabrigosbrasil.com.br/register/?tipo=voluntario"
                className="inline-flex items-center rounded-full bg-brand-primary px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                Quero ser um voluntário
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
