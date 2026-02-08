import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { Heading, Text } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Política de Privacidade",
  description:
    "Como coletamos, tratamos e protegemos dados pessoais na plataforma Medicina de Abrigos Brasil.",
  canonical: "/politica-de-privacidade",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Política de Privacidade"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Política de Privacidade" }]}
      />

      <LegalPageLayout activePath="/politica-de-privacidade">
        <header className="space-y-4">
          <Heading as="h2" className="text-2xl font-semibold text-brand-primary">
            Política de Privacidade
          </Heading>
          <Text className="leading-relaxed">
            Seja bem-vindos(as) à política de privacidade do Medicina de Abrigos Brasil! Nesta
            política você compreenderá como seus dados pessoais são tratados e para quais
            finalidades eles são usados.
          </Text>
          <Text className="leading-relaxed">
            Antes de começarmos, reforçamos nosso compromisso com a sua privacidade e proteção de
            dados. Isso é central para o nosso propósito. Privacidade está no centro dos processos e
            na cultura organizacional: todos os colaboradores e parceiros respeitam a proteção de
            dados.
          </Text>
          <Text className="leading-relaxed">
            Para você entender como os dados pessoais são tratados, vamos te contar um pouco mais
            sobre o que fazemos aqui no Medicina de Abrigos Brasil.
          </Text>
        </header>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Quem somos e o que fazemos?
          </Heading>
          <Text className="leading-relaxed">
            A Medicina de Abrigos Brasil – Infodados de Abrigos de Animais é uma iniciativa idealizada
            por pesquisadores vinculados ao Departamento de Medicina Veterinária da Universidade
            Federal do Paraná financiada pela Fundação Araucária, SETI e SEDEST. Nossa missão é
            promover a ciência da medicina de abrigos no Brasil e ser um banco de dados nacional
            centralizado e padronizado para estatísticas de abrigos de animais.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Dados pessoais coletados e finalidades
          </Heading>
          <Text className="leading-relaxed">
            Dados pessoais que coletamos nos nossos formulários e por que precisamos dessas
            informações:
          </Text>
          <Text className="leading-relaxed font-semibold">
            Os dados pessoais coletados de VOLUNTÁRIOS são:
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>Nome social completo</li>
            <li>Telefone</li>
            <li>Faixa etária</li>
            <li>Gênero</li>
            <li>Profissão</li>
            <li>Escolaridade</li>
            <li>Estado / Cidade</li>
            <li>Disponibilidade de tempo para trabalho voluntário</li>
            <li>Período de disponibilidade (diário, semanal, quinzenal, semestral)</li>
            <li>Experiência em trabalho voluntário na causa animal</li>
            <li>Forma de atuação (remoto, presencial, híbrido)</li>
            <li>Habilidades para trabalho voluntário</li>
            <li>Comentários adicionais sobre trabalho voluntário</li>
            <li>Como ficou sabendo da iniciativa MV Abrigos Brasil</li>
          </ul>
          <Text className="leading-relaxed font-semibold">Finalidade:</Text>
          <Text className="leading-relaxed">
            Utilizar os dados coletados como fonte de pesquisa de Doutorado e estudos futuros sobre
            Medicina Veterinária de Abrigos.
          </Text>
          <Text className="leading-relaxed font-semibold">
            Os dados pessoais coletados de ABRIGOS são:
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>Tipo do abrigo</li>
            <li>CNPJ ou CPF do responsável</li>
            <li>Nome do abrigo</li>
            <li>Endereço completo do abrigo (CEP, rua, número, bairro, cidade, estado)</li>
            <li>Website do abrigo</li>
            <li>Data de fundação do abrigo</li>
            <li>Espécies abrigadas pelo abrigo</li>
            <li>Convênio com lares temporários</li>
            <li>População inicial de animais do abrigo (cães e gatos)</li>
            <li>Como ficou sabendo da iniciativa MV Abrigos Brasil</li>
            <li>Nome da pessoa autorizada pelo abrigo</li>
            <li>Cargo da pessoa autorizada</li>
            <li>E-mail da pessoa autorizada</li>
            <li>Telefone da pessoa autorizada</li>
          </ul>
          <Text className="leading-relaxed font-semibold">Finalidade:</Text>
          <Text className="leading-relaxed">
            Utilizar os dados coletados como fonte de pesquisa de Doutorado e estudos futuros sobre
            Medicina Veterinária de Abrigos.
          </Text>

          <Text className="leading-relaxed font-semibold">
            Dados coletados no CADASTRO e LOGIN:
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>E-mail</li>
            <li>Senha (armazenada de forma criptografada)</li>
          </ul>
          <Text className="leading-relaxed font-semibold">Finalidade:</Text>
          <Text className="leading-relaxed">
            Autenticação e controle de acesso à plataforma, garantindo que apenas usuários
            autorizados acessem as áreas protegidas do sistema.
          </Text>

          <Text className="leading-relaxed font-semibold">
            Dados coletados no FORMULÁRIO DE CONTATO:
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>Nome</li>
            <li>E-mail</li>
            <li>Assunto</li>
            <li>Mensagem</li>
          </ul>
          <Text className="leading-relaxed font-semibold">Finalidade:</Text>
          <Text className="leading-relaxed">
            Responder a dúvidas, solicitações e sugestões enviadas pelos usuários.
          </Text>

          <Text className="leading-relaxed font-semibold">
            Dados coletados em CANDIDATURA A VAGAS de voluntariado:
          </Text>
          <Text className="leading-relaxed">
            Ao se candidatar a uma vaga de voluntariado publicada por um abrigo, o sistema associa
            o perfil do voluntário (dados já cadastrados) à vaga em questão, permitindo que o abrigo
            visualize as informações do candidato.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Serviços de terceiros
          </Heading>
          <Text className="leading-relaxed">
            Para o funcionamento da plataforma, utilizamos os seguintes serviços de terceiros que
            podem processar dados:
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong>Supabase</strong> — autenticação de usuários e armazenamento de dados da
              plataforma (banco de dados).
            </li>
            <li>
              <strong>Vercel Analytics</strong> — coleta de dados analíticos de uso do site,
              condicionada ao consentimento de cookies analíticos.
            </li>
            <li>
              <strong>Vercel Speed Insights</strong> — monitoramento de desempenho do site,
              condicionado ao consentimento de cookies analíticos.
            </li>
            <li>
              <strong>ImageKit</strong> — hospedagem e otimização de imagens exibidas na plataforma.
            </li>
            <li>
              <strong>ViaCEP</strong> — consulta de endereço a partir do CEP informado no cadastro
              de abrigos.
            </li>
            <li>
              <strong>IBGE</strong> — consulta de lista de estados e cidades para os formulários de
              cadastro.
            </li>
          </ul>
          <Text className="leading-relaxed">
            Nenhum desses serviços recebe mais dados do que o estritamente necessário para sua
            função. Os dados analíticos (Vercel Analytics e Speed Insights) só são coletados após o
            consentimento do usuário, conforme nossa{" "}
            <a
              href="/politica-de-cookies"
              className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              Política de Cookies
            </a>
            .
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Compartilhamento
          </Heading>
          <Text className="leading-relaxed">
            Compartilhamos seus dados apenas para as finalidades mencionadas e jamais venderemos ou
            enviaremos para outras empresas com objetivo de obter vantagem. A base de dados formada
            está sob nossa responsabilidade e o uso, acesso e compartilhamento acontecem dentro dos
            limites desta Política.
          </Text>
          <Text className="leading-relaxed">
            Nossos fornecedores e parceiros são escolhidos a dedo. Se a empresa não seguir a LGPD e
            não cuidar de segurança da informação, buscamos outra. Nossos operadores precisam ter o
            mesmo cuidado que temos “dentro de casa”.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Direitos do titular
          </Heading>
          <Text className="leading-relaxed">
            Seus dados, suas regras. Você pode solicitar:
          </Text>
          <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
            <li>Confirmação da existência de tratamento;</li>
            <li>Acesso aos dados;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
            <li>
              Portabilidade dos dados a outro fornecedor, conforme regulamentação, observados os
              segredos comercial e industrial;
            </li>
            <li>
              Eliminação dos dados pessoais tratados com consentimento (exceto quando há base legal
              para mantê-los);
            </li>
            <li>Informação das entidades públicas e privadas com as quais houve compartilhamento;</li>
            <li>Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;</li>
            <li>Revogação do consentimento.</li>
          </ol>
          <Text className="leading-relaxed">
            Solicitações podem ser feitas pelo e-mail:{" "}
            <a
              href="mailto:privacidade@filartigacunha.com.br"
              className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              privacidade@filartigacunha.com.br
            </a>
            . Responderemos em até 15 dias, conforme LGPD.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Retenção e descarte
          </Heading>
          <Text className="leading-relaxed">
            Mantemos seus dados somente pelo tempo necessário à finalidade. Ao alcançá-la, os dados
            são descartados. Quando há obrigação regulatória ou contratual, mantemos pelo prazo
            exigido. Atendemos solicitações de exclusão, especialmente para comunicações, de forma
            célere.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Segurança
          </Heading>
          <Text className="leading-relaxed">
            Temos política de segurança e controle de acessos, vemos segurança como investimento e
            contamos com soluções de proteção de rede, atualizações constantes e controles em cloud
            privada. Revisamos periodicamente como melhorar nossa segurança e escolhemos operadores
            confiáveis que levam o tema a sério.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Cookies
          </Heading>
          <Text className="leading-relaxed">
            Consulte a nossa{" "}
            <a
              href="/politica-de-cookies"
              className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              Política de Cookies
            </a>{" "}
            para saber mais.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Atualização
          </Heading>
          <Text className="leading-relaxed">Nossa última atualização foi 08/02/2026.</Text>
          <Text className="leading-relaxed">
            Dúvidas? Entre em contato:{" "}
            <a
              href="mailto:contato@mvabrigos.com.br"
              className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              contato@mvabrigos.com.br
            </a>
            . Será um prazer falar de privacidade e proteção de dados com você.
          </Text>
        </section>
      </LegalPageLayout>
    </main>
  );
}
