import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { Heading, Text } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Termos de Uso",
  description:
    "Condições para utilizar a plataforma, acessar dados e interagir com os serviços da Medicina de Abrigos Brasil.",
  canonical: "/termos-de-uso",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Termos de Uso"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Termos de Uso" }]}
      />

      <LegalPageLayout activePath="/termos-de-uso">
        <section className="space-y-4">
          <Heading as="h2" className="text-2xl font-semibold text-brand-primary">
            Termos de uso
          </Heading>
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            1. Uso do site
          </Heading>
          <Text className="leading-relaxed">
            O site{" "}
            <a
              href="https://mvabrigosbrasil.com.br/"
              className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              www.mvabrigosbrasil.com.br
            </a>{" "}
            tem o objetivo de promover a ciência da medicina de abrigos no Brasil e ser um banco de
            dados nacional centralizado e padronizado para estatísticas de abrigos de animais.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            2. Da utilização do site
          </Heading>
          <Text className="leading-relaxed">
            O site apresenta textos e outras formas de comunicação ou informações úteis (“informações”)
            com o intuito de divulgar os serviços e atividades que presta. As informações têm caráter
            exclusivamente informativo e não configuram proposta oficial de negócio, opinião, parecer,
            orientação, consultoria ou recomendação legal.
          </Text>
          <Text className="leading-relaxed">
            Buscamos manter o site atualizado, mas não garantimos que as informações sempre estejam
            atuais. Não nos responsabilizamos por ações tomadas com base nos conteúdos, nem por perdas
            ou danos a terceiros com base nas informações do site.
          </Text>
          <Text className="leading-relaxed">
            Textos informativos podem conter links para outros sites para complementar informação. Se
            seu site reutiliza nossos conteúdos, ele não deve conter material inadequado ou ilegal; caso
            contrário, pedimos que não faça menção ao nosso site.
          </Text>
          <Text className="leading-relaxed">
            Conteúdos podem ser reproduzidos em nossas redes sociais (Facebook e Instagram) para fins de
            comunicação e marketing. Comentários ofensivos, com informações sigilosas ou automações
            (spam/bots) serão removidos.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            3. Direitos de propriedade intelectual
          </Heading>
          <Text className="leading-relaxed">
            O design do site e todos os materiais publicados (textos, marcas, logotipos, gráficos,
            fotografias, vídeos e outros conteúdos) são de propriedade da Medicina de Abrigos Brasil e
            protegidos por direitos autorais e outras leis.
          </Text>
          <Text className="leading-relaxed">
            Não há transferência de direitos ao usuário. É expressamente vedada a cópia, reprodução,
            comercialização, publicação ou distribuição total ou parcial sem permissão prévia por
            escrito, salvo quando autorizado com crédito adequado.
          </Text>
          <Text className="leading-relaxed">
            Pedidos de permissão devem especificar URL, artigo ou recurso a reproduzir. O conteúdo não
            pode ser modificado sem consentimento. Layout/design são protegidos e não podem ser
            imitados. Uso indevido implica responsabilidade civil, criminal e administrativa do usuário.
          </Text>
          <Text className="leading-relaxed">
            A Medicina de Abrigos Brasil pode adotar medidas para proteger direitos autorais próprios e
            de terceiros.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            4. Privacidade de dados pessoais
          </Heading>
          <Text className="leading-relaxed">
            Coletamos e tratamos dados pessoais com respeito e transparência. Para saber mais, consulte
            nossa{" "}
            <a
              href="/politica-de-privacidade"
              className="font-semibold text-brand-primary underline underline-offset-4 transition hover:text-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              Política de Privacidade
            </a>
            .
          </Text>
          <Text className="leading-relaxed">
            Ao postar conteúdo (texto, fotos etc.) em páginas de grupo ou perfis, você declara possuir
            ou controlar os direitos necessários. Você não enviará conteúdo fraudulento ou enganoso e
            indeniza a Medicina de Abrigos Brasil por reclamações decorrentes do conteúdo enviado.
          </Text>
          <Text className="leading-relaxed">
            Ao enviar ou postar, você concede licença não exclusiva, isenta de royalties, perpétua,
            irrevogável e mundial para reproduzir, usar e distribuir seu conteúdo, com esforços para
            creditar sua autoria.
          </Text>
          <Text className="leading-relaxed">
            Todo conteúdo postado é responsabilidade de quem o publica. A Medicina de Abrigos Brasil
            pode remover conteúdo que viole estes termos e pode adotar medidas legais cabíveis.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            5. Conduta do Usuário
          </Heading>
          <Text className="leading-relaxed">
            Não publique ataques pessoais ou críticas ofensivas a indivíduos ou organizações de
            bem-estar animal. Não crie múltiplos IDs para atrapalhar a comunidade.
          </Text>
          <Text className="leading-relaxed">
            É proibido enviar material ilegal, ameaçador, calunioso, difamatório, obsceno, ofensivo,
            pornográfico ou profano, ou que constitua ofensa criminal, gere responsabilidade civil ou
            viole a lei; também é proibido enviar informações confidenciais, segredos comerciais, spam,
            correntes, esquemas de pirâmide ou vírus de software.
          </Text>
          <Text className="leading-relaxed">
            Conteúdo inadequado pode ser removido a critério da Medicina de Abrigos Brasil, que poderá
            tomar medidas legais para proteger o site e seu conteúdo.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            6. Isenção de responsabilidade
          </Heading>
          <Text className="leading-relaxed">
            O uso do site, fóruns e blogs é por sua conta e risco. O site é fornecido “como está”, sem
            garantias de precisão, disponibilidade contínua, correção de defeitos ou ausência de vírus.
            Avalie os riscos associados ao uso de qualquer conteúdo.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            7. Limitação de responsabilidade
          </Heading>
          <Text className="leading-relaxed">
            A Medicina de Abrigos Brasil não será responsável por danos diretos, indiretos, incidentais,
            punitivos ou consequentes decorrentes do uso ou incapacidade de uso do site, mesmo se
            avisada sobre a possibilidade de tais danos.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            8. Indenização
          </Heading>
          <Text className="leading-relaxed">
            Você concorda em defender, indenizar e isentar a Medicina de Abrigos Brasil e equipe contra
            responsabilidades, custos e despesas decorrentes do uso ou uso indevido do site. A
            organização pode assumir a defesa a seu critério, sem isentá-lo das obrigações de
            indenização.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            9. Interpretação
          </Heading>
          <Text className="leading-relaxed">
            Se alguma disposição for considerada inválida, as demais permanecem em vigor. Falha ou
            atraso na aplicação não significa renúncia.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            10. Links para sites de terceiros
          </Heading>
          <Text className="leading-relaxed">
            Links para sites de terceiros são fornecidos como conveniência; o acesso é por sua conta e
            risco. Não controlamos esses sites nem seu conteúdo, e a inclusão de links não implica
            endosso.
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            11. Escolha de Lei e Fórum
          </Heading>
          <Text className="leading-relaxed">
            Termos regidos pela lei brasileira. Foro competente: Comarca de São Paulo (SP).
          </Text>
        </section>

        <section className="space-y-3">
          <Heading as="h3" className="text-xl font-semibold text-brand-primary">
            12. Alterações dos termos de uso
          </Heading>
          <Text className="leading-relaxed">
            A Medicina de Abrigos Brasil pode alterar o site ou estes termos a qualquer momento, sem
            prévia notificação. Versões atualizadas serão publicadas no site; ao continuar usando, você
            concorda com as novas condições. Consulte regularmente os Termos de Uso.
          </Text>
        </section>
      </LegalPageLayout>
    </main>
  );
}
