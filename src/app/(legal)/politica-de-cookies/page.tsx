import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { Heading, Text } from "@/components/ui/typography";

const thirdPartyRows = [
  { name: "__Secure-3PSIDCC", purpose: "Identificar usuários e rastrear a atividade.", duration: "12 meses" },
  {
    name: "__Secure-3PAPISID",
    purpose: "Construir perfil de interesses e exibir anúncios do Google e YouTube de forma relevante e personalizada.",
    duration: "13 meses",
  },
  {
    name: "__Secure-1PAPISID",
    purpose: "Construir perfil de interesses e exibir anúncios do Google de forma relevante e personalizada.",
    duration: "13 meses",
  },
  {
    name: "__Secure-1PSID",
    purpose: "Construir perfil de interesses e exibir anúncios do Google de forma relevante e personalizada.",
    duration: "13 meses",
  },
  {
    name: "SAPISID",
    purpose: "Permitir que o Google colete informações do usuário para vídeos hospedados pelo YouTube.",
    duration: "13 meses",
  },
  {
    name: "__Secure-3PSID",
    purpose: "Construir perfil de interesses e exibir anúncios do Google e YouTube de forma relevante e personalizada.",
    duration: "13 meses",
  },
  { name: "APISID", purpose: "Usado pelo Google para armazenar as preferências do usuário.", duration: "13 meses" },
  { name: "HSID", purpose: "Fornecer prevenção a fraudes.", duration: "13 meses" },
  {
    name: "SSID",
    purpose: "Permitir que o Google colete informações do usuário para vídeos hospedados pelo YouTube.",
    duration: "13 meses",
  },
  {
    name: "SID",
    purpose: "Entrega de anúncios ou retargeting e prevenção a fraudes.",
    duration: "13 meses",
  },
  {
    name: "YSC",
    purpose: "Rastrear visualizações de vídeos incorporados nas páginas do YouTube.",
    duration: "Durante a sessão",
  },
  { name: "LOGIN_INFO", purpose: "Conhecer de onde vem o usuário.", duration: "24 meses" },
  {
    name: "VISITOR_INFO1_LIVE",
    purpose: "Permitir que o YouTube conte as visualizações de vídeos incorporados.",
    duration: "6 meses",
  },
  {
    name: "__Secure-1PSIDCC",
    purpose: "Necessário para usar as opções e serviços do site.",
    duration: "6 dias",
  },
  { name: "SIDCC", purpose: "Fornecer identificação de tráfego confiável da web.", duration: "6 meses" },
  {
    name: "NID",
    purpose: "Lembrar preferências e outras informações (idioma, resultados de pesquisa, filtro SafeSearch).",
    duration: "6 meses",
  },
  { name: "AEC", purpose: "Evitar que sites maliciosos ajam em nome do usuário.", duration: "24 meses" },
  { name: "IP_JAR", purpose: "Armazenar informações de acesso e personalizar anúncios.", duration: "9 meses" },
  { name: "SEARCH_SAMESITE", purpose: "Usado para o envio correto de dados para o Google.", duration: "12 meses" },
];

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
              <strong>Cookies de terceiros:</strong> criados por outros sites, com imagens e anúncios.
            </li>
            <li>
              <strong>Cookies de funcionalidade:</strong> guardam preferências para não precisar
              informar sempre que acessar.
            </li>
            <li>
              <strong>Cookies de propaganda/publicidade:</strong> coletam informações para exibir
              anúncios personalizados.
            </li>
          </ul>
          <Text className="leading-relaxed">
            Cookies maliciosos podem acompanhar atividade online para construir perfis e vender
            informações para publicidade com anúncios personalizados.
          </Text>
        </section>

        <section className="space-y-4">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Quais cookies utilizamos?
          </Heading>

          <div className="space-y-3">
            <Heading as="h4" className="text-lg font-semibold text-brand-primary">
              7.1 – Cookies Necessários
            </Heading>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm text-brand-secondary">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Nome
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Finalidade
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Duração
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">intercom-session-cgfc6jcc</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Necessário para o uso das opções e serviços do site.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">6 dias</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">intercom-id-cgfc6jcc</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Necessário para o uso das opções e serviços do site.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">9 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <Heading as="h4" className="text-lg font-semibold text-brand-primary">
              7.2 – Cookies Analíticos
            </Heading>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm text-brand-secondary">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Nome
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Finalidade
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Duração
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2" rowSpan={2}>
                      _ga
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Registrar um número individual de ID para gerar dados estatísticos de visitas.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">24 meses</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">
                      Identificação de usuário único, número de visitas e horários, origens de tráfego
                      da primeira visita, início e fim de cada sessão.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2" />
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">mkjs_group_id</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Permite que o Segment acompanhe atividades do usuário.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">6 meses</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">_gcl_au</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Usado pelo Google Analytics para entender a interação do usuário com o site.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">3 meses</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">mkjs_user_id</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Permite que o Segment acompanhe atividades do usuário.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">12 meses</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">ajs_anonymous_id</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Utilizado para Analytics; ajuda a contar visitantes e identificar se já visitou o
                      site antes.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">12 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <Heading as="h4" className="text-lg font-semibold text-brand-primary">
              7.3 – Cookies de Terceiros
            </Heading>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm text-brand-secondary">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Nome
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Finalidade
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Duração
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {thirdPartyRows.map((row) => (
                    <tr key={row.name} className="even:bg-gray-50">
                      <td className="border-b border-gray-200 px-3 py-2">{row.name}</td>
                      <td className="border-b border-gray-200 px-3 py-2">{row.purpose}</td>
                      <td className="border-b border-gray-200 px-3 py-2">{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <Heading as="h4" className="text-lg font-semibold text-brand-primary">
              7.4 – Cookies de Propaganda
            </Heading>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm text-brand-secondary">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Nome
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Finalidade
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold">
                      Duração
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">hubspotutk</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      Armazenar e rastrear a identidade de um visitante.
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">6 meses</td>
                  </tr>
                  <tr className="even:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">__hstc</td>
                    <td className="border-b border-gray-200 px-3 py-2">Armazenar o tempo de visita.</td>
                    <td className="border-b border-gray-200 px-3 py-2">13 meses</td>
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
            Exceto o cookie obrigatório, você pode desativar os demais na página de Gestão de Cookies
            ou diretamente no seu navegador/aparelho.
          </Text>
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
            Na maioria dos navegadores, usando “ctrl+shift+del” você pode limpar dados do navegador,
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
