import type { JSX } from "react";
import Link from "next/link";

import AppImage from "@/components/ui/AppImage";
import { Heading, Text } from "@/components/ui/typography";
import type { PartnerLogo } from "@/constants/partners";
import {
  PARTNERS_CONTACT_EMAIL,
  PARTNERS_INTRO,
  PARTNER_FINANCIERS,
  PARTNER_REALIZERS,
  PARTNER_SPONSORS,
  PARTNER_SUPPORTERS,
} from "@/constants/partners";

type PartnerGridSectionProps = {
  id: string;
  title: string;
  description: string;
  items: PartnerLogo[];
};

function PartnerGridSection({
  id,
  title,
  description,
  items,
}: PartnerGridSectionProps): JSX.Element {
  return (
    <section aria-labelledby={`${id}-title`} className="mt-12">
      <header className="space-y-3">
        <Heading
          as="h3"
          id={`${id}-title`}
          className="font-22 text-text-default"
        >
          {title}
        </Heading>
        <Text className="text-base leading-relaxed text-text-default">
          {description}
        </Text>
      </header>

      <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(({ name, image, alt }) => (
          <li
            key={`${id}-${name}-${image}`}
            className="flex flex-col items-center rounded-2xl bg-white"
          >
            <div className="flex h-32 w-full items-center justify-center">
              <AppImage
                src={image}
                alt={alt ?? name}
                width={220}
                height={140}
                className="h-full w-auto max-w-full object-contain"
                sizes="(max-width: 640px) 50vw, 240px"
              />
            </div>
            <p className="mt-3 text-center text-base font-normal leading-snug text-text-default">
              {name}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PartnersContentSection(): JSX.Element {
  return (
    <section
      aria-labelledby="partners-title"
      className="flex justify-center items-center bg-white py-10"
    >
      <div className="max-w-4xl px-6">
        <Text>{PARTNERS_INTRO}</Text>
        <Text>
          Caso você seja um abrigo (seja ele público, privado ou misto) ou um
          lar temporário/protetor independente que resgata e abriga cães e
          gatos, e quer nos ajudar registrando seus dados da dinâmica
          populacional mensal,{" "}
          <strong>
            <Link
              href="/login"
              className="text-brand-primary underline underline-offset-4"
            >
              cadastre-se aqui
            </Link>
          </strong>
          . Ao participar como um contribuidor de dados, você terá acesso a um
          banco de dados objetivo e imparcial de suas próprias estatísticas do
          abrigo e também de outras instituições, tanto a nível local quanto
          nacional. Você estará ajudando a melhorar a compreensão sobre a
          realidade dos animais abandonados e em situação de risco, na
          construção de políticas públicas mais eficazes e a alocar melhor os
          recursos em vários abrigos ou provedores de serviços para animais.
        </Text>
        <Text>
          Caso você seja uma organização/empresa privada ou pública e se
          interessou pelo projeto, compactua com a nossa missão e objetivos, e
          queira nos ajudar com contribuições e doações, entre em contato
          conosco via e-mail:{" "}
          <Link
            href={`mailto:${PARTNERS_CONTACT_EMAIL}`}
            className="font-semibold text-brand-primary underline underline-offset-4"
          >
            {PARTNERS_CONTACT_EMAIL}
          </Link>
        </Text>

        <PartnerGridSection
          id="realizadores"
          title="Realizadores"
          description="A iniciativa foi idealizada por três pesquisadores que fazem parte da equipe de Medicina Veterinária do Coletivo vinculados ao Programa de Pós-graduação em Ciências Veterinárias da Universidade Federal do Paraná. A partir da experiência e vivência dos pesquisadores na área da Medicina de Abrigos, percebeu-se o quanto era difícil obter informações sobre o quantitativo de abrigos brasileiros e, da mesma forma, dos abrigos terem acesso a informações de qualidade e fidedignas sobre a ciência da Medicina de Abrigos que pudessem modificar a realidade das suas organizações por meio de fundamentos e práticas que visam aumentar o bem-estar dos animais abrigados e dos colaboradores envolvidos."
          items={PARTNER_REALIZERS}
        />

        <PartnerGridSection
          id="financiadores"
          title="Financiadores"
          description="A construção dessa iniciativa faz parte de um projeto de pesquisa ainda maior que participou da Chamada Pública 13/2019 (Programa de Pesquisa Aplicada à Saúde Única), sendo contemplado e financiado pela Fundação Araucária, Secretária de Estado do Desenvolvimento Sustentável e do Turismo (SEDEST) e Superintendência Geral de Ciência, Tecnologia e Ensino Superior (SETI) do estado do Paraná."
          items={PARTNER_FINANCIERS}
        />

        <PartnerGridSection
          id="apoiadores"
          title="Apoiadores"
          description="Os apoiadores são organizações/instituições que têm auxiliado tecnicamente e/ou promovido ações relacionadas com a missão e objetivo dessa iniciativa."
          items={PARTNER_SUPPORTERS}
        />

        <PartnerGridSection
          id="patrocinadores"
          title="Patrocinadores"
          description="Os patrocinadores são organizações/instituições que têm auxiliado financeiramente a iniciativa, viabilizando a construção, manutenção e continuação das ações referentes à missão e objetivos do site."
          items={PARTNER_SPONSORS}
        />
      </div>
    </section>
  );
}
