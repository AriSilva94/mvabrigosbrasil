import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { Heading, Text } from "@/components/ui/typography";

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
            <li>Cidade / Estado</li>
            <li>Profissão</li>
            <li>Escolaridade</li>
            <li>Experiência em trabalho voluntário</li>
            <li>Disponibilidade para trabalho voluntário</li>
            <li>Habilidades para trabalho voluntário</li>
            <li>Observações sobre trabalho voluntário</li>
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
            <li>Nome do abrigo</li>
            <li>Endereço completo do abrigo</li>
            <li>Website do abrigo</li>
            <li>Data de fundação do abrigo</li>
            <li>Espécies abrigadas pelo abrigo</li>
            <li>População atual de animais do abrigo</li>
            <li>Nome autorização do abrigo</li>
            <li>Cargo autorização do abrigo</li>
            <li>E-mail autorização do abrigo</li>
            <li>Telefone autorização do abrigo</li>
          </ul>
          <Text className="leading-relaxed font-semibold">Finalidade:</Text>
          <Text className="leading-relaxed">
            Utilizar os dados coletados como fonte de pesquisa de Doutorado e estudos futuros sobre
            Medicina Veterinária de Abrigos.
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
          <Text className="leading-relaxed">Nossa última atualização foi 22/10/2022.</Text>
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
