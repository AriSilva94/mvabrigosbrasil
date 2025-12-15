import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { Heading, Text } from "@/components/ui/typography";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Contrato de Uso de Dados"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Contrato de Uso de Dados" }]}
      />

      <LegalPageLayout activePath="/contrato-de-uso-de-dados">
        <section className="space-y-4">
          <Heading as="h2" className="text-2xl font-semibold text-brand-primary">
            Introdução
          </Heading>
          <Text className="leading-relaxed">
            A Medicina de Abrigos Brasil – Infodados de Abrigos de Animais coleta dados de abrigos
            (apenas cães e gatos) de organizações governamentais, não governamentais e pessoas
            físicas. Os dados da dinâmica populacional (entradas e saídas) representam apenas uma
            parte do trabalho que as organizações realizam. Para obter mais informações sobre as
            operações de cada organização, visite seus sites individuais. Leia atentamente as
            informações abaixo para entender a responsabilidade associada ao acesso aos dados.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Política de Uso de Dados
          </Heading>
          <Text className="leading-relaxed">
            No espírito da declaração de missão do Medicina de Abrigos Brasil (MAB) em “promover a
            ciência da medicina de abrigos no Brasil e ser um banco de dados nacional centralizado e
            padronizado para estatísticas de abrigos de animais”, segue a Política de Uso de Dados
            para garantir que possamos compartilhar o banco de dados nacional e ser bons
            administradores dos dados e de seu uso.
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              É responsabilidade de quem solicita acesso entender as limitações do conjunto de dados
              (por exemplo, lacunas em períodos específicos ou amostras que não representam toda a
              realidade de uma comunidade).
            </li>
            <li>
              Os dados isoladamente não representam o trabalho completo de uma organização; busque
              contexto e impacto além dos números.
            </li>
            <li>
              A MAB adota uma visão propositalmente positiva dos esforços e intenções das
              organizações. No uso dos dados, trate com respeito as organizações membros do banco de
              dados nacional, independentemente de opiniões pessoais. Os dados não podem ser usados
              para difamar o trabalho de indivíduos ou organizações.
            </li>
            <li>
              Indivíduos ou instituições que queiram utilizar o banco de dados devem aderir a esta
              Política de Uso de Dados e concordar com o Contrato de Uso de Dados.
            </li>
            <li>
              A MAB se reserva o direito de limitar ou negar acesso ao banco de dados ou downloads,
              com ou sem justa causa, a qualquer momento.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Contrato de Uso de Dados
          </Heading>
          <Text className="leading-relaxed">
            Este Contrato de Uso de Dados (“Contrato”) é entre você, o usuário dos dados
            (“Destinatário”) e a Medicina de Abrigos Brasil (“MAB”). Ao visualizar os dados
            disponibilizados neste site (“Banco de Dados”), o Destinatário concorda em ficar
            vinculado aos termos e condições deste Contrato.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Prazo e Rescisão
          </Heading>
          <Text className="leading-relaxed">
            Este Contrato permanece em pleno vigor até ser rescindido. Será rescindido
            automaticamente, sem aviso, se o Destinatário não cumprir a Política de Uso de Dados ou
            este Contrato, ou imediatamente mediante notificação por escrito do Destinatário ou da
            MAB. Após a rescisão, o Destinatário concorda em destruir todas as cópias dos Dados sob
            sua custódia ou controle.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Uso de Dados
          </Heading>
          <Text className="leading-relaxed">
            A MAB concede ao Destinatário uma licença não exclusiva, revogável, limitada e
            intransferível para usar os Dados exclusivamente para (1) pesquisa, relatórios, fins
            acadêmicos ou científicos ou (2) uso interno e não comercial. A divulgação é permitida
            apenas sob as restrições abaixo:
          </Text>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              Dados que não identifiquem pessoas ou animais podem ser incluídos em publicações
              acadêmicas, de pesquisa ou de reportagem, apenas de forma agregada ou resumida, sem
              incluir o conjunto completo.
            </li>
            <li>
              Nenhuma publicação pode depreciar ou retratar negativamente a MAB ou colaboradores dos
              Dados.
            </li>
            <li>
              Cada publicação deve creditar “Medicina de Abrigos Brasil – Infodados de Abrigos de
              Animais” e incluir a legenda indicada pela MAB.
            </li>
            <li>
              O Destinatário deve notificar imediatamente a MAB sobre qualquer uso ou publicação e
              fornecer a citação ou localização apropriada.
            </li>
          </ul>
          <Text className="leading-relaxed">
            Exceto conforme estabelecido, o Destinatário não pode: (i) reproduzir, vender, alugar,
            arrendar, emprestar, distribuir, sublicenciar ou transferir os Dados, no todo ou em
            parte; (ii) usar os Dados para criar produto derivado para revenda, arrendamento ou
            licença; ou (iii) usar os Dados para finalidade comercial. O Destinatário deve tomar
            medidas razoáveis para impedir divulgação não autorizada e, se encontrar informação
            identificável, deve notificar e excluir imediatamente.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Representações e Garantias MAB
          </Heading>
          <Text className="leading-relaxed">
            A MAB declara ter os direitos necessários para disponibilizar e distribuir os Dados. Fora
            isso, os Dados são fornecidos “como estão” e “conforme disponíveis”, sem garantias de
            qualquer tipo, incluindo precisão, disponibilidade contínua, correção de defeitos,
            ausência de vírus ou adequação a um fim específico.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Representações do Destinatário
          </Heading>
          <Text className="leading-relaxed">
            O Destinatário está em conformidade com todas as leis, regulamentos e requisitos
            aplicáveis aos quais está sujeito.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Limitação de responsabilidade
          </Heading>
          <Text className="leading-relaxed">
            Em nenhum caso a MAB será responsável perante o Destinatário ou terceiros por danos
            diretos, lucros cessantes, danos indiretos, incidentais, punitivos ou consequentes
            decorrentes do uso ou incapacidade de uso dos Dados, mesmo que alertada sobre a
            possibilidade de tais danos.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Indenização
          </Heading>
          <Text className="leading-relaxed">
            O Destinatário deve defender, indenizar e isentar a MAB e suas afiliadas contra custos,
            reclamações, perdas, danos materiais, lesões corporais ou morte, ou violações de
            propriedade intelectual decorrentes de: (a) violação deste Contrato; (b) violação de
            direitos de propriedade intelectual de terceiros; (c) violação da lei aplicável; e
            (d) uso dos Dados e de qualquer publicação.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Alívio Equitativo
          </Heading>
          <Text className="leading-relaxed">
            A violação deste Contrato pode causar danos irreparáveis à MAB que não podem ser remediados
            apenas com indenização monetária. Em caso de inadimplência que possa causar dano
            irreparável, a MAB tem direito a medida cautelar imediata, além de outros recursos
            disponíveis.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            Diversos
          </Heading>
          <Text className="leading-relaxed">
            O MAB pode ceder, transferir ou delegar direitos e obrigações sem consentimento. O
            Destinatário não pode ceder ou sublicenciar sem consentimento prévio por escrito.
          </Text>
          <Text className="leading-relaxed">
            Este Contrato não cria agência, parceria ou relação de emprego. Representa o acordo
            integral entre as partes sobre os Dados e substitui comunicações anteriores. Disposições
            inexequíveis serão limitadas ou eliminadas para manter o restante em vigor. Falha em
            exigir cumprimento não é renúncia.
          </Text>
          <Text className="leading-relaxed">
            Disposições que devam sobreviver à rescisão permanecerão válidas, incluindo limitações de
            responsabilidade e indenização. Modificações ao Contrato são efetivas apenas para
            visualizações e downloads após a modificação.
          </Text>
          <Text className="leading-relaxed">
            Notificações são consideradas entregues quando recebidas; devem ser por escrito, referenciar
            este Contrato e ser enviadas por e-mail, em mãos, correio pré-pago ou registrado para o
            endereço informado quando as partes celebram este Contrato.
          </Text>
          <Text className="leading-relaxed">
            Este Contrato é regido e interpretado pelas leis brasileiras. O Destinatário concorda com
            jurisdição exclusiva nos tribunais estaduais ou federais localizados em XXXXX e se submete
            ao exercício da jurisdição pessoal desses tribunais. A parte vencedora em ação para fazer
            valer direitos terá direito a custos e honorários advocatícios.
          </Text>
        </section>
      </LegalPageLayout>
    </main>
  );
}
