export type Report = {
  slug: string;
  title: string;
  description: string;
  image: string;
  publishedAt?: string;
  contentUrl?: string;
};

export const REPORTS: Report[] = [
  {
    slug: "relatorio-anual-2025",
    title: "Relatório Anual 2025",
    description:
      "Apresentamos um panorama inédito da dinâmica populacional dos abrigos e lares temporários em todo o país. Mais do que números, este documento revela tendências, desafios e avanços que ajudam a compreender o cenário da proteção animal no Brasil. Confira!",
    image: "/assets/img/MVABRIGOS-Rel-Anual-2025_page-0001.jpg",
    publishedAt: "04/2026",
    contentUrl: "/assets/pdf/MVABRIGOS-Rel-Anual-2025.pdf",
  },
];
