export type LibraryItem = {
  slug: string;
  title: string;
  category: string;
  imageSrc: string;
  externalUrl: string;
  publishedAt?: string;
  summary?: string;
  contentUrl?: string;
};

export const libraryItems: LibraryItem[] = [
  {
    slug: "the-association-of-shelter-veterinarians-guidelines-for-humane-rabbit-housing-in-animal-shelters",
    title:
      "The Association of Shelter Veterinarians’ Guidelines for Humane Rabbit Housing in Animal Shelters",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/the-association-of-shelter-veterinarians-guidelines-for-humane-rabbit-housing-in-animal-shelters.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/the-association-of-shelter-veterinarians-guidelines-for-humane-rabbit-housing-in-animal-shelters/",
    publishedAt: "09/2025",
    summary:
      "Diretrizes para abrigos com foco em moradias humanizadas para coelhos.",
    contentUrl:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/2025/09/the-association-of-shelter-veterinarians-guidelines-for-humane-rabbit-housing-in-animal-shelters.pdf",
  },
  {
    slug: "lamina-funcao-e-papel-abrigos-projeto-mva",
    title: "Lamina Função e Papel Abrigos – Projeto MVA",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/lamina-funcao-e-papel-abrigos-projeto-mva.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/lamina-funcao-e-papel-abrigos-projeto-mva/",
    publishedAt: "06/2025",
    summary:
      "Resumo visual sobre função e papel dos abrigos dentro do projeto MVA.",
    contentUrl:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/2025/06/lamina-funcao-e-papel-abrigos-projeto-mva.pdf",
  },
  {
    slug: "recursos-humanos-em-abrigos-de-caes-e-gatos-parametros-tecnicos-para-dimensionamento-de-equipes-de-medicos-veterinarios-e-tratadores",
    title:
      "Recursos Humanos em Abrigos de Cães e Gatos: Parâmetros Técnicos para Dimensionamento de Equipes de Médicos Veterinários e Tratadores",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/recursos-humanos-em-abrigos-de-caes-e-gatos-parametros-tecnicos-para-dimensionamento-de-equipes-de-medicos-veterinarios-e-tratadores.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/recursos-humanos-em-abrigos-de-caes-e-gatos-parametros-tecnicos-para-dimensionamento-de-equipes-de-medicos-veterinarios-e-tratadores/",
    publishedAt: "06/2025",
    summary:
      "Parâmetros técnicos para dimensionar equipes de veterinários e tratadores em abrigos.",
    contentUrl:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/2025/06/recursos-humanos-em-abrigos-de-caes-e-gatos-parametros-tecnicos-para-dimensionamento-de-equipes-de-medicos-veterinarios-e-tratadores.pdf",
  },
  {
    slug: "diretrizes-de-rt-e-manejo",
    title: "Diretrizes de RT e Manejo",
    category: "Informativos Técnicos",
    imageSrc: "/assets/img/library/diretrizes-de-rt-e-manejo.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/diretrizes-de-rt-e-manejo/",
    publishedAt: "13/06/2025",
    summary:
      "Orientações para uniformizar a atuação de responsáveis técnicos em programas e mutirões de esterilização cirúrgica.",
    contentUrl:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/2025/06/Diretrizes-de-RT-Manejo.pdf",
  },

  // A PARTIR DAQUI: ITENS NOVOS (sem publishedAt/summary/contentUrl por enquanto)

  {
    slug: "revista-de-ciencia-e-inovacao",
    title: "Revista de Ciência e Inovação",
    category: "Artigos Científicos",
    imageSrc: "/assets/img/library/revista-de-ciencia-e-inovacao.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/revista-de-ciencia-e-inovacao/",
  },
  {
    slug: "teoria-das-capacidades-juridicas-dos-animais",
    title: "Teoria das Capacidades Jurídicas dos Animais",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/teoria-das-capacidades-juridicas-dos-animais.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/teoria-das-capacidades-juridicas-dos-animais/",
  },
  {
    slug: "terminologia-sobre-abandono-de-animais-domesticos-para-uso-na-america-latina",
    title:
      "Terminologia sobre abandono de animais domésticos para uso na América Latina",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/terminologia-sobre-abandono-de-animais-domesticos-para-uso-na-america-latina.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/terminologia-sobre-abandono-de-animais-domesticos-para-uso-na-america-latina/",
  },
  {
    slug: "2024-wsava-guidelines-for-the-control-of-reproduction-in-dogs-and-cats",
    title:
      "2024 WSAVA guidelines for the control of reproduction in dogs and cats",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/2024-wsava-guidelines-for-the-control-of-reproduction-in-dogs-and-cats.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/2024-wsava-guidelines-for-the-control-of-reproduction-in-dogs-and-cats/",
  },
  {
    slug: "manual-boas-praticas-abrigos-caes-e-gatos-em-desastres",
    title: "Manual Boas-práticas Abrigos Cães e Gatos em Desastres",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/manual-boas-praticas-abrigos-caes-e-gatos-em-desastres.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/manual-boas-praticas-abrigos-caes-e-gatos-em-desastres/",
  },
  {
    slug: "lsart-household-pet-evacuation-sheltering-manual",
    title: "LSART HOUSEHOLD PET EVACUATION & SHELTERING MANUAL",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/lsart-household-pet-evacuation-sheltering-manual.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/lsart-household-pet-evacuation-sheltering-manual/",
  },
  {
    slug: "shelter-operations-pet-friendly-shelters-emergency-llis",
    title: "Shelter Operations- Pet-Friendly Shelters – Emergency – LLIS",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/shelter-operations-pet-friendly-shelters-emergency-llis.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/shelter-operations-pet-friendly-shelters-emergency-llis/",
  },
  {
    slug: "current-best-practices-in-animal-emergency-management-mass-care-and-sheltering",
    title:
      "Current Best Practices in Animal Emergency Management – Mass Care and Sheltering",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/current-best-practices-in-animal-emergency-management-mass-care-and-sheltering.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/current-best-practices-in-animal-emergency-management-mass-care-and-sheltering/",
  },
  {
    slug: "enriquecimento-ambiental-como-ferramenta-de-bem-estar-para-abrigos-de-caes",
    title:
      "Enriquecimento Ambiental como Ferramenta de Bem-estar para Abrigos de Cães",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/enriquecimento-ambiental-como-ferramenta-de-bem-estar-para-abrigos-de-caes.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/enriquecimento-ambiental-como-ferramenta-de-bem-estar-para-abrigos-de-caes/",
  },
  {
    slug: "plano-nacional-de-contingencia-de-desastres-em-massa-envolvendo-animal",
    title:
      "Plano Nacional de Contingência de Desastres em Massa Envolvendo Animal",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/plano-nacional-de-contingencia-de-desastres-em-massa-envolvendo-animal.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/plano-nacional-de-contingencia-de-desastres-em-massa-envolvendo-animal/",
  },
  {
    slug: "entenda-mais-sobre-a-iniciativa-medicina-de-abrigo-brasil",
    title: "Entenda mais sobre a iniciativa “Medicina de Abrigo Brasil”",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/entenda-mais-sobre-a-iniciativa-medicina-de-abrigo-brasil.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/entenda-mais-sobre-a-iniciativa-medicina-de-abrigo-brasil/",
  },
  {
    slug: "reflexoes-e-planejamento-para-implementacao-de-abrigos",
    title: "Reflexoes e planejamento para implementação de abrigos",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/reflexoes-e-planejamento-para-implementacao-de-abrigos.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/reflexoes-e-planejamento-para-implementacao-de-abrigos/",
  },
  {
    slug: "soroprevalencia-de-anticorpos-contra-o-virus-da-cinomose-canina-parvovirus-e-adenovirus-em-caes-de-um-abrigo-de-animais-brasileiro",
    title:
      "Soroprevalência de anticorpos contra o vírus da cinomose canina, parvovírus e adenovírus em cães de um abrigo de animais brasileiro",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/soroprevalencia-de-anticorpos-contra-o-virus-da-cinomose-canina-parvovirus-e-adenovirus-em-caes-de-um-abrigo-de-animais-brasileiro.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/soroprevalencia-de-anticorpos-contra-o-virus-da-cinomose-canina-parvovirus-e-adenovirus-em-caes-de-um-abrigo-de-animais-brasileiro/",
  },
  {
    slug: "reduzindo-os-latidos-em-um-abrigo-de-animais-brasileiro-uma-intervencao-pratica",
    title:
      "Reduzindo os latidos em um abrigo de animais brasileiro: Uma intervenção prática",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/reduzindo-os-latidos-em-um-abrigo-de-animais-brasileiro-uma-intervencao-pratica.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/reduzindo-os-latidos-em-um-abrigo-de-animais-brasileiro-uma-intervencao-pratica/",
  },
  {
    slug: "medicina-veterinaria-do-coletivo-responsabilidade-tecnica-em-unidades-de-vigilancia-de-zoonoses-uvzs",
    title:
      "Medicina veterinária do coletivo responsabilidade técnica em unidades de vigilância de zoonoses-uvzs",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/medicina-veterinaria-do-coletivo-responsabilidade-tecnica-em-unidades-de-vigilancia-de-zoonoses-uvzs.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/medicina-veterinaria-do-coletivo-responsabilidade-tecnica-em-unidades-de-vigilancia-de-zoonoses-uvzs/",
  },
  {
    slug: "guia-animais-em-situacao-de-acumulacao",
    title: "Guia Animais em Situação de Acumulação",
    category: "Guias/Manuais",
    imageSrc: "/assets/img/library/guia-animais-em-situacao-de-acumulacao.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/guia-animais-em-situacao-de-acumulacao/",
  },
  {
    slug: "impactos-de-animais-domesticos-sobre-a-biodiversidade-das-areas-verdes",
    title:
      "Impactos de animais domésticos sobre a biodiversidade das áreas verdes",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/impactos-de-animais-domesticos-sobre-a-biodiversidade-das-areas-verdes.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/impactos-de-animais-domesticos-sobre-a-biodiversidade-das-areas-verdes/",
  },
  {
    slug: "protocolo-de-resgate-seletivo-de-caes-e-gatos",
    title: "Protocolo de Resgate Seletivo de Cães e Gatos",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/protocolo-de-resgate-seletivo-de-caes-e-gatos.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/protocolo-de-resgate-seletivo-de-caes-e-gatos/",
  },
  {
    slug: "gestao-de-residuos-solidos-para-abrigos-de-caes-e-gatos",
    title: "Gestão de resíduos sólidos para abrigos de cães e gatos",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/gestao-de-residuos-solidos-para-abrigos-de-caes-e-gatos.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/gestao-de-residuos-solidos-para-abrigos-de-caes-e-gatos/",
  },
  {
    slug: "manual-de-ced-captura-esterilizacao-e-de-devolucao-de-felinos-de-vida-livre",
    title:
      "Manual de CED – Captura, esterilização e devolução de felinos de vida livre",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/manual-de-ced-captura-esterilizacao-e-de-devolucao-de-felinos-de-vida-livre.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/manual-de-ced-captura-esterilizacao-e-de-devolucao-de-felinos-de-vida-livre/",
  },
  {
    slug: "dinamica-populacional-em-abrigos-de-caes-e-gatos-importancia-do-controle-de-entrada-e-saida-na-gestao-e-no-bem-estar-animal",
    title:
      "Dinâmica populacional em abrigos de cães e gatos: importância do controle de entrada e saída na gestão e no bem-estar animal",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/dinamica-populacional-em-abrigos-de-caes-e-gatos-importancia-do-controle-de-entrada-e-saida-na-gestao-e-no-bem-estar-animal.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/dinamica-populacional-em-abrigos-de-caes-e-gatos-importancia-do-controle-de-entrada-e-saida-na-gestao-e-no-bem-estar-animal/",
  },
  {
    slug: "protocolo-de-interacao-humano-cao-ihc-e-treinamento-tr-para-caes-em-situacao-de-abrigo",
    title:
      "Protocolo de Interação Humano-cão (IHC) e Treinamento (TR) para Cães em Situação de Abrigo",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/protocolo-de-interacao-humano-cao-ihc-e-treinamento-tr-para-caes-em-situacao-de-abrigo.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/protocolo-de-interacao-humano-cao-ihc-e-treinamento-tr-para-caes-em-situacao-de-abrigo/",
  },
  {
    slug: "2022-aafp-isfm-cat-friendly-veterinary-interaction-guidelines",
    title: "2022 AAFP/ISFM Cat Friendly Veterinary Interaction Guidelines",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/2022-aafp-isfm-cat-friendly-veterinary-interaction-guidelines.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/2022-aafp-isfm-cat-friendly-veterinary-interaction-guidelines/",
  },
  {
    slug: "journal-of-shelter-medicine-community-animal-health",
    title: "Journal of Shelter Medicine & Community Animal Health",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/journal-of-shelter-medicine-community-animal-health.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/journal-of-shelter-medicine-community-animal-health/",
  },
  {
    slug: "2022-isfm-aafp-cat-friendly-veterinary-environment-guidelines",
    title: "2022 ISFM/AAFP Cat Friendly Veterinary Environment Guidelines",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/2022-isfm-aafp-cat-friendly-veterinary-environment-guidelines.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/2022-isfm-aafp-cat-friendly-veterinary-environment-guidelines/",
  },
  {
    slug: "medicina-de-abrigos-principios-e-diretrizes",
    title: "Medicina de Abrigos: Princípios e Diretrizes",
    category: "Livros",
    imageSrc:
      "/assets/img/library/medicina-de-abrigos-principios-e-diretrizes.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/livros/medicina-de-abrigos-principios-e-diretrizes/",
  },
  {
    slug: "vacinacao-e-vermifugacao-em-abrigos-de-caes-e-gatos",
    title: "Vacinação e Vermifugação em abrigos de cães e gatos",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/vacinacao-e-vermifugacao-em-abrigos-de-caes-e-gatos.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/vacinacao-e-vermifugacao-em-abrigos-de-caes-e-gatos/",
  },
  {
    slug: "manejo-higienico-abrigos-de-caes-e-gatos",
    title: "Manejo Higiênico Abrigos de Cães e Gatos",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/manejo-higienico-abrigos-de-caes-e-gatos.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/manejo-higienico-abrigos-de-caes-e-gatos/",
  },
  {
    slug: "clinica-convencional-x-med-abrigos",
    title: "Clínica Convencional x Med Abrigos",
    category: "Informativos Técnicos",
    imageSrc: "/assets/img/library/clinica-convencional-x-med-abrigos.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/clinica-convencional-x-med-abrigos/",
  },
  {
    slug: "vaccination-principles-for-dogs-and-cats-in-animal-shelters",
    title: "Vaccination principles for dogs and cats in animal shelters",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/vaccination-principles-for-dogs-and-cats-in-animal-shelters.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/vaccination-principles-for-dogs-and-cats-in-animal-shelters/",
  },
  {
    slug: "quarentena-e-isolamento-em-abrigos-de-caes-e-gatos",
    title: "Quarentena e Isolamento em abrigos de cães e gatos",
    category: "Informativos Técnicos",
    imageSrc:
      "/assets/img/library/quarentena-e-isolamento-em-abrigos-de-caes-e-gatos.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/informativos-tecnicos/quarentena-e-isolamento-em-abrigos-de-caes-e-gatos/",
  },
  {
    slug: "diretrizes-sobre-os-padroes-de-cuidados-em-abrigos-de-animais",
    title: "Diretrizes sobre os Padrões de Cuidados em Abrigos de Animais",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/diretrizes-sobre-os-padroes-de-cuidados-em-abrigos-de-animais.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/diretrizes-sobre-os-padroes-de-cuidados-em-abrigos-de-animais/",
  },
  {
    slug: "code-of-practice-for-the-management-of-dogs-and-cats-in-shelters-and-pounds",
    title:
      "Code of Practice for the Management of Dogs and Cats in Shelters and Pounds",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/code-of-practice-for-the-management-of-dogs-and-cats-in-shelters-and-pounds.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/code-of-practice-for-the-management-of-dogs-and-cats-in-shelters-and-pounds/",
  },
  {
    slug: "2020-aafp-feline-retrovirus-testing-and-management-guidelines-special-article",
    title:
      "2020 AAFP Feline Retrovirus Testing and Management Guidelines – Special Article",
    category: "Guias/Manuais",
    imageSrc:
      "/assets/img/library/2020-aafp-feline-retrovirus-testing-and-management-guidelines-special-article.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/2020-aafp-feline-retrovirus-testing-and-management-guidelines-special-article/",
  },
  {
    slug: "dog-and-cat-population-management",
    title: "Dog and Cat Population Management",
    category: "Guias/Manuais",
    imageSrc: "/assets/img/library/dog-and-cat-population-management.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/guias-manuais/dog-and-cat-population-management/",
  },
  {
    slug: "capacitacao-e-percepcao-de-medicos-veterinarios-gestores-funcionarios-e-voluntarios-atuantes-nos-abrigos-em-medicina-de-abrigos-no-brasil",
    title:
      "Capacitação e percepção de médicos-veterinários, gestores, funcionários e voluntários atuantes nos abrigos em Medicina de Abrigos no Brasil",
    category: "Artigos Científicos",
    imageSrc:
      "/assets/img/library/capacitacao-e-percepcao-de-medicos-veterinarios-gestores-funcionarios-e-voluntarios-atuantes-nos-abrigos-em-medicina-de-abrigos-no-brasil.jpg",
    externalUrl:
      "https://mvabrigosbrasil.com.br/artigos-cientificos/capacitacao-e-percepcao-de-medicos-veterinarios-gestores-funcionarios-e-voluntarios-atuantes-nos-abrigos-em-medicina-de-abrigos-no-brasil/",
  },
];
