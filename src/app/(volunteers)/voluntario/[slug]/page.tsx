import type { JSX } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { redirect } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import Alert from "@/components/ui/Alert";
import ProfileField from "@/components/ui/ProfileField";
import { getVolunteerProfileBySlug } from "@/services/volunteersService";
import { buildMetadata } from "@/lib/seo";
import { formatPhone } from "@/lib/formatters";

type FromParam = "voluntarios" | "painel";

interface VolunteerPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: FromParam }>;
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
  const canonicalSlug = profile?.slug || slug;

  return buildMetadata({
    title: displayName,
    description,
    canonical: `/voluntario/${canonicalSlug}`,
  });
}

export default async function Page({
  params,
  searchParams,
}: VolunteerPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const { from } = await searchParams;
  const fromVoluntarios = from === "voluntarios";
  const fromPainel = from === "painel";

  const backHref = fromPainel ? "/painel" : "/programa-de-voluntarios";
  const backLabel = fromPainel ? "Painel" : "Programa de Voluntários";

  const profile = await getVolunteerProfileBySlug(slug);

  if (!profile) redirect("/programa-de-voluntarios");

  const displayName = profile.name || "Perfil de voluntário";
  const location =
    profile.city && profile.state
      ? `${profile.city} - ${profile.state}`
      : profile.city || profile.state || "Não informado";

  return (
    <main>
      <PageHeader
        title="Perfil de Voluntário"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: backLabel, href: backHref },
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
                  <ProfileField label="Nome Social" value={profile.name ?? "Voluntário"} />
                </div>
                <div className="md:text-right">
                  <ProfileField label="Cidade/Estado" value={location} />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ProfileField label="Profissão" value={profile.profession} />
              <ProfileField label="Escolaridade" value={profile.schooling} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ProfileField
                label="Telefone"
                value={profile.phone ? formatPhone(profile.phone) : undefined}
              />
              <ProfileField label="E-mail" value={profile.email} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ProfileField label="Faixa Etária" value={profile.ageRange} />
              <ProfileField
                label="Experiente em trabalho voluntário"
                value={profile.experience}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ProfileField
                label="Disponibilidade trabalho voluntário"
                value={profile.availability}
              />
              <ProfileField label="Período" value={profile.period} />
            </div>

            <ProfileField label="Habilidades" value={profile.skills} />
            <ProfileField label="Observações" value={profile.notes} />

            {fromVoluntarios ? (
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/painel"
                  className="inline-flex items-center rounded-full bg-[#a3a74b] px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3a74b]"
                >
                  Preciso de um voluntário
                </Link>
                <Link
                  href="/painel"
                  className="inline-flex items-center rounded-full bg-brand-primary px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  Quero ser um voluntário
                </Link>
              </div>
            ) : (
              <Alert variant="info">
                Em caso de interesse, entre em contato com o voluntário através dos contatos de{" "}
                <strong>e-mail</strong> ou <strong>telefone</strong>.
              </Alert>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
