type BaseNavLink = {
  href: string;
  label: string;
};

export type MainNavLink = BaseNavLink & {
  hasDropdown?: boolean;
};

export const TOP_NAV_LINKS: BaseNavLink[] = [
  { href: "/", label: "Inicial" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/contato", label: "Contato" },
];

export const INSTITUTIONAL_LINKS: BaseNavLink[] = [
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/equipe-mv", label: "Equipe" },
  { href: "/medicina-de-abrigos", label: "Medicina de Abrigos" },
  { href: "/parceiros", label: "Parceiros" },
];

export const MAIN_NAV_LINKS: MainNavLink[] = [
  { href: "/quem-somos", label: "Institucional", hasDropdown: true },
  { href: "/banco-de-dados", label: "Banco de Dados" },
  { href: "/programa-de-voluntarios", label: "Voluntários" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/materias", label: "Matérias" },
  { href: "/relatorios", label: "Relatórios" },
];
