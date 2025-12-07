import type { JSX } from "react";
import Link from "next/link";
import { BadgeCheck, UserCheck2, Video } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import { PANEL_SHORTCUTS, TRAINING_URL } from "@/constants/panel";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

const VOLUNTEER_SHORTCUTS = [
  {
    id: "vacancies",
    title: "Vagas Disponíveis",
    href: "/programa-de-voluntarios",
    icon: BadgeCheck,
    emphasize: false,
  },
  {
    id: "trainings",
    title: "Treinamentos",
    href: TRAINING_URL,
    icon: Video,
    emphasize: false,
  },
  {
    id: "profile",
    title: "Meu Cadastro",
    href: "/meu-cadastro",
    icon: UserCheck2,
    emphasize: true,
  },
] as const;

async function getPostTypeFromWpPosts(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  postAuthorId: number | null,
): Promise<string | null> {
  if (!postAuthorId) return null;

  const { data: wpPost, error } = await supabaseAdmin
    .from("wp_posts_raw")
    .select("post_type")
    .eq("post_author", postAuthorId)
    .not("post_type", "is", null)
    .maybeSingle();

  if (error) {
    console.error("painel: erro ao buscar post_type em wp_posts_raw", {
      postAuthorId,
      error,
    });
  }

  console.log("painel: wp_posts_raw result", { postAuthorId, wpPost });

  return wpPost?.post_type ?? null;
}

async function getUserPostType(): Promise<string | null> {
  const supabase = await getServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) return null;

  const supabaseAdmin = getSupabaseAdminClient();

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("wp_user_id, email")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("painel: erro ao buscar perfil do usuário", profileError);
    return null;
  }

  console.log("painel: perfil supabase", { profile, authUserId: authData.user.id });

  const postAuthorId = profile?.wp_user_id ?? null;
  const email = profile?.email ?? authData.user.email ?? null;

  const postTypeFromProfile = await getPostTypeFromWpPosts(supabaseAdmin, postAuthorId);
  console.log("painel: post_type por wp_posts_raw via profile", {
    postAuthorId,
    postTypeFromProfile,
  });
  if (postTypeFromProfile) return postTypeFromProfile;

  if (email) {
    const { data: legacyUser, error: legacyError } = await supabaseAdmin
      .from("wp_users_legacy")
      .select("id")
      .ilike("user_email", email)
      .maybeSingle();

    if (legacyError) {
      console.error("painel: erro ao buscar legacy por email", { email, legacyError });
    }

    const legacyUserId = legacyUser?.id ?? null;

    const postType = await getPostTypeFromWpPosts(supabaseAdmin, legacyUserId);

    console.log("painel: post_type via legacy lookup", {
      email,
      legacyUserId,
      postType,
    });

    if (postType) return postType;
  }

  return null;
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
              <span className="font-normal">Veja como funciona a plataforma.</span>
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
          <ul className="grid gap-5 md:grid-cols-2">
            {VOLUNTEER_SHORTCUTS.map(({ id, title, href, icon: Icon, emphasize }) => (
              <li
                key={id}
                className={emphasize ? "md:col-span-2 md:mx-auto md:max-w-xl" : undefined}
              >
                <Link
                  href={href}
                  className="group flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#f5f5f6] px-8 py-10 text-center transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(16,130,89,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <Icon
                    className="h-12 w-12 text-brand-primary transition group-hover:scale-105"
                    aria-hidden
                  />
                  <Heading as="h3" className="mt-4 text-[20px] font-semibold text-[#555a6d]">
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
  );
}

export default async function Page(): Promise<JSX.Element> {
  const postType = await getUserPostType();
  const isVolunteer = postType === "voluntario";

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
