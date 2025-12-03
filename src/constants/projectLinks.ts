import { BarChart3, FileText, UserCheck2 } from "lucide-react";

import type { ProjectLink } from "@/types/who-we-are.types";

export const PROJECT_LINKS: ProjectLink[] = [
  {
    label: "Banco de Dados",
    href: "/banco-de-dados",
    icon: BarChart3,
  },
  {
    label: "Cadastre-se",
    href: "/login",
    icon: UserCheck2,
  },
  {
    label: "Biblioteca",
    href: "/biblioteca",
    icon: FileText,
  },
];
