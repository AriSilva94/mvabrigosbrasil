import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import OpenCookiePreferencesButton from "@/components/cookies/OpenCookiePreferencesButton";
import { Heading, Text } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Política de Cookies",
  description:
    "Saiba como utilizamos cookies e tecnologias semelhantes e confira finalidades, duração e controle de consentimento.",
  canonical: "/politica-de-cookies",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Política de Cookies"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Política de Cookies" }]}
      />

      <LegalPageLayout activePath="/politica-de-cookies">
        <section className="space-y-4">
          <Heading as="h2" className="text-2xl font-semibold text-brand-primary">
            Política de Cookies
          </Heading>
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            O que são cookies?
          </Heading>
          <Text className="leading-relaxed">
            Cookies são pequenos arquivos criados por sites que você visita e salvos no navegador.
            Eles podem identificar quem está visitando a página para personalizar de acordo com o
            perfil ou facilitar a navegação em várias páginas sem precisar reconfigurar preferências,
            como idioma.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Quais os tipos de cookies? O que fazem?
          </Heading>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong>Cookies de sessão:</strong> temporários, duram apenas enquanto o navegador está
              aberto. Fazem identificação genérica e não coletam dados pessoais.
            </li>
            <li>
              <strong>Cookies permanentes:</strong> registram identificação do usuário, comportamento
              de navegação e preferências, armazenados no disco rígido até expirarem ou serem
              excluídos.
            </li>
            <li>
              <strong>Cookies necessários/obrigatórios:</strong> o mínimo para abrir o site e acessar
              funcionalidades básicas.
            </li>
            <li>
              <strong>Cookies analíticos:</strong> ajudam a melhorar desempenho e experiência,
              indicando páginas acessadas e frequência.
            </li>
            <li>
              <strong>Cookies de funcionalidade:</strong> guardam preferências para não precisar
              informar sempre que acessar.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Quais cookies utilizamos?
          </Heading>

          {/* Cookies Necessários */}
          <div className="space-y-3">
            <Heading as="h4" className="text-lg font-semibold text-brand-primary">
              1 – Cookies Necessários
            </Heading>
            <Text className="text-sm leading-relaxed">
              Essenciais para autenticação e funcionamento básico do site. Não podem ser desativados.
            </Text>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm text-brand-secondary">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">Nome</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">Finalidade</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">Duração</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">sb-*-auth-token</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Cookie de autenticação do Supabase. Mantém a sessão do usuário logado.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">Durante a sessão</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">cookie_consent</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Armazena suas preferências de consentimento de cookies.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">12 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cookies Analíticos */}
          <div className="space-y-3">
            <Heading as="h4" className="text-lg font-semibold text-brand-primary">
              2 – Cookies Analíticos
            </Heading>
            <Text className="text-sm leading-relaxed">
              Nos ajudam a entender como você usa o site para melhorar a experiência. Só são carregados com seu consentimento.
            </Text>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm text-brand-secondary">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">Nome</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">Finalidade</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">Duração</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">va (Vercel Analytics)</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Registra dados anônimos de visitas para análise de uso do site.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">Durante a sessão</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">_ga</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Registrar um número individual de ID para gerar dados estatísticos de visitas (Google Analytics).
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">24 meses</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">_gcl_au</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Usado pelo Google Analytics para entender a interação do usuário com o site.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">3 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <Text className="leading-relaxed">
            Coletamos somente os <strong>cookies necessários</strong> para o site funcionar
            corretamente. Os demais são opcionais: seus dados, suas regras. Você decide com quais
            cookies deseja navegar e personaliza sua experiência.
          </Text>
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Posso desativar estes cookies?
          </Heading>
          <Text className="leading-relaxed">
            Exceto os cookies necessários, você pode desativar os demais a qualquer momento
            clicando no botão abaixo ou no link &quot;Configurar cookies&quot; no rodapé do site.
          </Text>

          <div className="pt-2">
            <OpenCookiePreferencesButton className="inline-flex items-center justify-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-primary/85 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:ring-offset-1">
              Configurar cookies
            </OpenCookiePreferencesButton>
          </div>

          <Text className="leading-relaxed">
            A desativação pode afetar algumas ferramentas e funcionalidades e remover preferências
            salvas, impactando a experiência.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Como eliminar todos os cookies do meu navegador?
          </Heading>
          <Text className="leading-relaxed">
            Na maioria dos navegadores, usando &quot;ctrl+shift+del&quot; você pode limpar dados do navegador,
            incluindo cookies. Se a opção de cookies não estiver marcada, selecione e clique em
            apagar.
          </Text>
          <Text className="leading-relaxed">
            Se precisar de ajuda ou tiver dúvidas sobre esta política, envie um e-mail para{" "}
            <a
              href="mailto:contato@mvabrigos.com.br"
              className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              contato@mvabrigos.com.br
            </a>
            .
          </Text>
          <Text className="leading-relaxed">
            Para mais informações sobre como coletamos, usamos e compartilhamos suas informações
            pessoais, consulte nossa{" "}
            <a
              href="/politica-de-privacidade"
              className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              Política de Privacidade
            </a>
            .
          </Text>
        </section>
      </LegalPageLayout>
    </main>
  );
}
