import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo";
import TeamAccessForm from "@/app/(protected)/equipe/components/TeamAccessForm";
import TeamUserList from "@/app/(protected)/equipe/components/TeamUserList";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";

export const metadata = buildMetadata({
  title: "Equipe do Abrigo",
  description:
    "Cadastre novos usuários da sua equipe para que todos tenham acesso ao painel do abrigo.",
  canonical: "/equipe",
});

export default async function Page(): Promise<JSX.Element> {
  await enforceTeamAccess("/equipe");

  return (
    <main>
      <PageHeader
        title="Equipe"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Equipe" },
        ]}
      />

      <section className="bg-white pb-16 pt-8">
        <div className="container px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10">
            <header className="space-y-3 text-center">
              <Heading
                as="h2"
                className="text-[22px] font-semibold text-brand-secondary md:text-[26px]"
              >
                Adicionar pessoas da equipe
              </Heading>
              <Text className="text-base leading-relaxed text-[#68707b]">
                Crie logins adicionais para colegas do abrigo usando um e-mail e
                uma senha. Compartilhe as credenciais com a pessoa cadastrada
                para que ela acesse o painel e os recursos protegidos.
              </Text>
            </header>

            <TeamAccessForm />

            <div className="rounded-xl border border-[#e8ecf1] bg-[#f7fafc] px-5 py-4">
              <Heading as="h3" className="text-base font-semibold text-brand-secondary">
                Orientações rápidas
              </Heading>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#5f6473]">
                <li>Use e-mails individuais para cada pessoa da equipe.</li>
                <li>
                  As credenciais criadas aqui são para acessar o painel do
                  abrigo; mantenha-as em local seguro.
                </li>
                <li>
                  Se precisar remover algum acesso, altere a senha desse usuário
                  ou entre em contato pelo suporte.
                </li>
              </ul>
            </div>

            <TeamUserList />
          </div>
        </div>
      </section>
    </main>
  );
}
