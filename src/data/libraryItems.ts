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
    imageSrc: "/assets/img/library/lamina-funcao-e-papel-abrigos-projeto-mva.jpg",
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
];
