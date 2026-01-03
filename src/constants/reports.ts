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
    slug: "resultados-parciais-2025",
    title: "Resultados Parciais 2025",
    description:
      "Apresentamos um panorama inédito da dinâmica populacional dos abrigos e lares temporários em todo o país. Mais do que números, este documento revela tendências, desafios e avanços que ajudam a compreender o cenário da proteção animal no Brasil. Confira!",
    image: "/assets/img/capa_relatorio.jpg",
    publishedAt: "11/2025",
    contentUrl: "/assets/pdf/MVABRIGOS-Rel-vf.pdf",
  },
];
