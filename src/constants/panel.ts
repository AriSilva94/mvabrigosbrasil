import {
  BookOpen,
  Home,
  ListChecks,
  PawPrint,
  UserCheck2,
  Users,
} from "lucide-react";

import type { PanelShortcut } from "@/types/panel.types";

export const PANEL_SHORTCUTS: PanelShortcut[] = [
  {
    id: "dynamic-data",
    title: "Registrar Dinâmica Populacional",
    subtitle: "Dados Mensais",
    href: "/dinamica-populacional",
    icon: PawPrint,
  },
  {
    id: "vacancies",
    title: "Minhas Vagas",
    subtitle: "Voluntariado",
    href: "/minhas-vagas",
    icon: ListChecks,
  },
  {
    id: "exclusive-content",
    title: "Conteúdos Exclusivos",
    subtitle: "Medicina de Abrigos",
    href: "/conteudos-exclusivos",
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
    href: "/equipe",
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
