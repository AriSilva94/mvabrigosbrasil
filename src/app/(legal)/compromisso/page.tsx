import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

const CONTACT_EMAIL = "contato@mvabrigosbrasil.com.br";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Compromisso"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Contrato de Uso de Dados" },
        ]}
      />

      <LegalPageLayout activePath="/compromisso">
        <header className="space-y-4">
          <Heading as="h2" className="text-2xl font-semibold text-brand-primary">
            Introdução
          </Heading>
          <Text className="leading-relaxed">
            A Medicina de Abrigos Brasil – Infodados de Abrigos de Animais coleta
            dados de abrigos (apenas cães e gatos) de organizações governamentais,
            não governamentais e pessoas físicas. Os dados da dinâmica populacional
            (entradas e saídas) representam apenas uma parte do trabalho que as
            organizações realizam. Para obter mais informações sobre as operações
            de cada organização, visite seus sites individuais. Leia atentamente as
            informações abaixo para entender a responsabilidade associada ao acesso
            aos dados.
          </Text>
        </header>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Política de Uso de Dados
          </Heading>
          <Text className="leading-relaxed">
            No espírito da declaração de missão do Medicina de Abrigos Brasil (MAB)
            em “promover a ciência da medicina de abrigos no Brasil e ser um banco
            de dados nacional centralizado e padronizado para estatísticas de
            abrigos de animais”, segue a Política de Uso de Dados para garantir que
            possamos compartilhar o banco de dados nacional e ser bons
            administradores dos dados e de seu uso.
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              É responsabilidade de quem solicita acesso entender as limitações do
              conjunto de dados (por exemplo, lacunas em períodos específicos ou
              amostras que não representam toda a realidade de uma comunidade).
            </li>
            <li>
              Os dados isoladamente não representam o trabalho completo de uma
              organização; busque contexto e impacto além dos números.
            </li>
            <li>
              A MAB adota uma visão propositalmente positiva dos esforços e intenções
              das organizações. No uso dos dados, trate com respeito as organizações
              membros do banco de dados nacional, independentemente de opiniões
              pessoais. Os dados não podem ser usados para difamar o trabalho de
              indivíduos ou organizações.
            </li>
            <li>
              Indivíduos ou instituições que queiram utilizar o banco de dados devem
              aderir a esta Política de Uso de Dados e concordar com o Contrato de
              Uso de Dados.
            </li>
            <li>
              A MAB se reserva o direito de limitar ou negar acesso ao banco de dados
              ou downloads, com ou sem justa causa, a qualquer momento.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Contrato de Uso de Dados
          </Heading>
          <Text className="leading-relaxed">
            Este Contrato de Uso de Dados (“Contrato”) é entre você, o usuário dos
            dados (“Destinatário”), e a Medicina de Abrigos Brasil (“MAB”). Ao
            visualizar os dados disponibilizados neste site (“Banco de Dados”), o
            Destinatário concorda em ficar vinculado aos termos e condições deste
            Contrato.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Prazo e Rescisão
          </Heading>
          <Text className="leading-relaxed">
            Este Contrato permanece em vigor até ser rescindido. Ele é rescindido
            automaticamente se houver descumprimento da Política de Uso de Dados ou
            do Contrato, ou imediatamente mediante notificação escrita do
            Destinatário ou da MAB. Após a rescisão, o Destinatário deve destruir
            todas as cópias dos Dados sob sua custódia.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Uso de Dados
          </Heading>
          <Text className="leading-relaxed">
            A MAB concede ao Destinatário uma licença não exclusiva, revogável,
            limitada e intransferível para usar os Dados exclusivamente para
            pesquisa, relatórios, fins acadêmicos ou científicos, ou uso interno e
            não comercial. A divulgação é permitida apenas sob as restrições abaixo:
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              Dados que não identifiquem pessoas ou animais podem ser incluídos em
              publicações acadêmicas ou de reportagem, apenas de forma agregada.
            </li>
            <li>
              Nenhuma publicação pode depreciar ou retratar negativamente a MAB ou
              colaboradores dos dados.
            </li>
            <li>
              Cada publicação deve creditar “Medicina de Abrigos Brasil – Infodados
              de Abrigos de Animais” e incluir a legenda indicada no site.
            </li>
            <li>
              O Destinatário deve notificar a MAB sobre qualquer uso ou publicação,
              informando a citação ou localização.
            </li>
          </ul>
          <Text className="leading-relaxed">
            Exceto conforme estabelecido, o Destinatário não pode reproduzir, vender,
            alugar, sublicenciar, transferir ou usar os Dados para produtos derivados
            comerciais. Deve tomar medidas razoáveis para impedir divulgação não
            autorizada. Se encontrar informação que identifique pessoas ou animais,
            deve notificar e excluir imediatamente.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Representações e Garantias MAB
          </Heading>
          <Text className="leading-relaxed">
            A MAB declara ter os direitos necessários para disponibilizar os Dados.
            Eles são fornecidos “como estão” e “conforme disponíveis”, sem garantias
            de qualquer tipo, incluindo precisão, disponibilidade contínua, correção
            de defeitos ou ausência de vírus, nem que os resultados atenderão aos
            requisitos do Destinatário.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Representações do Destinatário
          </Heading>
          <Text className="leading-relaxed">
            O Destinatário está em conformidade com leis, regulamentos e demais
            requisitos aplicáveis aos quais está sujeito.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Limitação de responsabilidade
          </Heading>
          <Text className="leading-relaxed">
            Em nenhum caso a MAB será responsável por danos diretos, lucros cessantes
            ou danos indiretos, incidentais, punitivos ou consequentes decorrentes do
            uso ou incapacidade de uso dos Dados, mesmo que alertada sobre a
            possibilidade de tais danos.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Indenização
          </Heading>
          <Text className="leading-relaxed">
            O Destinatário deve defender, indenizar e isentar a MAB e suas afiliadas
            contra custos, perdas e responsabilidades decorrentes de violação deste
            Contrato, de direitos de terceiros, da lei aplicável ou do uso dos Dados
            e publicações.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Alívio Equitativo
          </Heading>
          <Text className="leading-relaxed">
            A violação deste Contrato pode causar danos irreparáveis à MAB. Em caso
            de inadimplência, a MAB tem direito a medida cautelar imediata para
            evitar danos, além de outros recursos disponíveis.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Diversos
          </Heading>
          <Text className="leading-relaxed">
            A MAB pode ceder direitos e obrigações sem consentimento. O Destinatário
            não pode ceder sem autorização prévia. Este Contrato não cria agência ou
            parceria e representa o acordo integral sobre os Dados. Disposições
            inexequíveis serão limitadas sem afetar o restante. O contrato é regido
            pelas leis brasileiras, e notificações devem ser feitas por escrito.
          </Text>
        </section>

        <section className="rounded-3xl border border-brand-primary/15 bg-brand-primary/5 p-6 shadow-sm md:p-8">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Fale com a encarregada
          </Heading>
          <div className="mt-3 space-y-3 text-base leading-relaxed text-color-secondary">
            <p>
              Dúvidas, reclamações ou sugestões sobre o tratamento dos seus dados
              pessoais podem ser enviadas diretamente para nossa Encarregada pelo
              Tratamento de Dados Pessoais, conforme o Artigo 41 da LGPD.
            </p>
            <div className="space-y-1">
              <p className="font-semibold text-brand-primary">
                Medicina de Abrigos Brasil
              </p>
              <p>
                E-mail:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </section>
      </LegalPageLayout>
    </main>
  );
}
