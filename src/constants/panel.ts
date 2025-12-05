import {
  Activity,
  BookOpen,
  Home,
  ListChecks,
  UserCheck2,
  Users,
} from "lucide-react";

import type { PanelShortcut } from "@/types/panel.types";

export const PANEL_SHORTCUTS: PanelShortcut[] = [
  {
    id: "dynamic-data",
    title: "Registrar Dinâmica Populacional",
    subtitle: "Dados Mensais",
    href: "/banco-de-dados",
    icon: Activity,
  },
  {
    id: "vacancies",
    title: "Minhas Vagas",
    subtitle: "Voluntariado",
    href: "/programa-de-voluntarios",
    icon: ListChecks,
  },
  {
    id: "exclusive-content",
    title: "Conteúdos Exclusivos",
    subtitle: "Medicina de Abrigos",
    href: "/biblioteca",
    icon: BookOpen,
  },
  {
    id: "volunteers",
    title: "Ver Voluntários",
    subtitle: "Lista completa",
    href: "/voluntarios",
    icon: Users,
  },
  {
    id: "team",
    title: "Equipe",
    subtitle: "Cadastrar Usuários",
    href: "/equipe-mv",
    icon: UserCheck2,
  },
  {
    id: "shelter",
    title: "Meu Abrigo",
    subtitle: "Editar Perfil",
    href: "/meu-cadastro",
    icon: Home,
  },
];

export const TRAINING_URL = "/treinamentos";
