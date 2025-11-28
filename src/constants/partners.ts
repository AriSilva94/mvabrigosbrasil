type PartnerLogo = {
  name: string;
  image: string;
  alt: string;
};

type PartnerGroup = {
  title: string;
  description: string;
  partners: PartnerLogo[];
};

type PartnersIntroContent = {
  introduction: string;
  contributorInvitation: string;
  organizationInvitation: string;
  registerHref: string;
  contactEmail: string;
};

export const PARTNERS_INTRO_CONTENT: PartnersIntroContent = {
  introduction:
    "A iniciativa Medicina de Abrigos Brasil – Infodados de Abrigos de Animais surgiu como uma forma de suprir a necessidade de promover a ciência da Medicina de Abrigos no país e obter dados representativos com base em estatísticas nacionais para o desenvolvimento de políticas públicas que reduzam o abandono de animais de estimação e promovam a adoção.",
  contributorInvitation:
    "Caso você seja um abrigo (seja ele público, privado ou misto) ou um lar temporário/protetor independente que resgata e abriga cães e gatos e quer nos ajudar registrando seus dados da dinâmica populacional mensal. Ao participar como um contribuidor de dados, você terá acesso a um banco de dados objetivo e imparcial de suas próprias estatísticas do abrigo e também de outras instituições, tanto a nível local quanto nacional.",
  organizationInvitation:
    "Caso você seja uma organização ou empresa privada ou pública, interessada no projeto e alinhada à nossa missão e objetivos, entre em contato conosco para contribuir com doações e parcerias.",
  registerHref: "https://mvabrigosbrasil.com.br/login",
  contactEmail: "contato@mvabrigosbrasil.com.br",
};

export const PARTNER_GROUPS: PartnerGroup[] = [
  {
    title: "Realizadores",
    description:
      "A iniciativa foi idealizada por três pesquisadores que fazem parte da equipe de Medicina Veterinária do Coletivo vinculados ao Programa de Pós-graduação em Ciências Veterinárias da Universidade Federal do Paraná. A partir da experiência e vivência dos pesquisadores na área da Medicina de Abrigos, percebeu-se o quanto era difícil obter informações sobre o quantitativo de abrigos brasileiros e, da mesma forma, dos abrigos terem acesso a informações de qualidade e fidedignas sobre a ciência da Medicina de Abrigos.",
    partners: [
      {
        name: "Universidade Federal do Paraná",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/logo-ufpr.png",
        alt: "Universidade Federal do Paraná",
      },
      {
        name: "Programa de Pós-graduação em Ciências Veterinárias",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/logo-ppgcv.png",
        alt: "Programa de Pós-graduação em Ciências Veterinárias",
      },
      {
        name: "Medicina Veterinária do Coletivo",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/logo-mvc.png",
        alt: "Medicina Veterinária do Coletivo",
      },
    ],
  },
  {
    title: "Financiadores",
    description:
      "A construção dessa iniciativa faz parte de um projeto de pesquisa ainda maior que participou da Chamada Pública 13/2019 (Programa de Pesquisa Aplicada à Saúde Única), sendo contemplado e financiado pela Fundação Araucária, SEDEST e SETI do estado do Paraná.",
    partners: [
      {
        name: "Fundação Araucária",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/fundacao_araucaria.png",
        alt: "Fundação Araucária",
      },
      {
        name: "SETI",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/SETI.png",
        alt: "SETI",
      },
      {
        name: "SEDEST",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/SEDEST.png",
        alt: "SEDEST",
      },
    ],
  },
  {
    title: "Apoiadores",
    description:
      "Os apoiadores são organizações e instituições que auxiliam tecnicamente e promovem ações relacionadas com a missão e o objetivo desta iniciativa.",
    partners: [
      {
        name: "IMVC",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/uploads/2025/11/IMVC2.jpg",
        alt: "IMVC",
      },
      {
        name: "Fórum Animal",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/FORUM.png",
        alt: "Fórum Animal",
      },
      {
        name: "Projeto Medicina Veterinária de Abrigos do Instituto PremieRpet",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/MEDVET.png",
        alt: "Projeto Medicina Veterinária de Abrigos do Instituto PremieRpet",
      },
      {
        name: "Peritus Vet",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/logo_peritus_vet.png",
        alt: "Peritus Vet",
      },
      {
        name: "Grupo de Pesquisa em Ética Animal",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logo(1).png",
        alt: "Grupo de Pesquisa em Ética Animal",
      },
      {
        name: "Grupo de Pesquisa em Ética Animal",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logo(2).png",
        alt: "Grupo de Pesquisa em Ética Animal",
      },
      {
        name: "Grupo de Pesquisa em Ética Animal",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logo(3).png",
        alt: "Grupo de Pesquisa em Ética Animal",
      },
      {
        name: "Grupo de Estudos em Ética e Direito dos Animais",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logo(4).png",
        alt: "Grupo de Estudos em Ética e Direito dos Animais",
      },
      {
        name: "Organização de Proteção Animal",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/logos/logo(5).png",
        alt: "Organização de Proteção Animal",
      },
      {
        name: "Instituto Caramelo",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/uploads/2023/07/caramelo.jpg",
        alt: "Instituto Caramelo",
      },
      {
        name: "Febraca",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/febraca2.jpg",
        alt: "Febraca",
      },
      {
        name: "AAC&T",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/aacet22.jpg",
        alt: "AAC&T",
      },
      {
        name: "Shelter Dogs MECA",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/uploads/2025/11/MECA2.jpg",
        alt: "Shelter Dogs MECA",
      },
    ],
  },
  {
    title: "Patrocinadores",
    description:
      "Os patrocinadores auxiliam financeiramente a iniciativa, viabilizando a construção, manutenção e continuação das ações referentes à missão e objetivos do site.",
    partners: [
      {
        name: "PremieRpet",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/uploads/2024/09/PREMIERVET2.jpg",
        alt: "PremieRpet",
      },
      {
        name: "Cobasi",
        image:
          "https://mvabrigosbrasil.com.br/wp-content/uploads/2023/07/cobasi.jpg",
        alt: "Cobasi",
      },
    ],
  },
];
