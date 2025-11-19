import type { BenefitItem } from "@/types/home.types";
import {
  Activity,
  BarChartHorizontal,
  BookOpen,
  CheckSquare,
  ClipboardCheck,
  Gauge,
  Settings,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";

export const NATIONAL_HEADING =
  "Por que é importante a NÍVEL NACIONAL mapear e coletar os dados da dinâmica populacional de abrigos de animais?";

export const SHELTER_HEADING =
  "Por que é importante PARA O ABRIGO registrar e coletar os dados da dinâmica populacional?";

export const NATIONAL_BENEFITS: BenefitItem[] = [
  {
    title: "Políticas Públicas Eficazes",
    description: "Ajuda a promover políticas públicas mais eficazes para os animais.",
  },
  {
    title: "Estimativa Populacional",
    description: "Ajuda a estimar o número de animais abandonados e em risco.",
  },
  {
    title: "Melhores Operações",
    description: "Auxilia a promover melhores práticas e operações.",
  },
  {
    title: "Banco de Dados Nacional",
    description: "Promove um conjunto completo, real e atualizado de dados nacional anual.",
  },
  {
    title: "Avaliação de Resultados",
    description:
      "Auxilia na avaliação dos resultados das estratégias de manejo de cães e gatos abandonados ou em situação de rua.",
  },
  {
    title: "Melhor Alocação de Recursos",
    description:
      "Facilita a alocação eficaz de recursos do governo e organizações de bem-estar animal.",
  },
];

export const SHELTER_BENEFITS: BenefitItem[] = [
  {
    title: "Estatística",
    description: "Analisar tendências de resgates ao longo dos meses e anos.",
    icon: <BarChartHorizontal className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Avaliação",
    description: "Avaliar padrões de doações de recursos por períodos temporais.",
    icon: <ClipboardCheck className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Identificação",
    description: "Identificar épocas de pico em adoções através de análise temporal.",
    icon: <Activity className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Planejamento",
    description: "Planejar financeiramente com base em projeções futuras.",
    icon: <Wallet className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Mapeamento",
    description: "Mapear prevalência de doenças na população abrigada por épocas.",
    icon: <MapSectionIcon />,
  },
  {
    title: "Conhecimento",
    description: "Estudar incidência e períodos de devolução de animais adotados.",
    icon: <BookOpen className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Necessidades",
    description: "Reconhecer necessidades estruturais, financeiras e humanas.",
    icon: <Settings className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Fluxo Médio",
    description: "Determinar fluxo médio anual de entrada e saída de animais.",
    icon: <Users className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Custos",
    description: "Comparar custo-benefício entre abrigos e lares temporários.",
    icon: <Wallet className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Estratégia",
    description: "Verificar efetividade de planos estratégicos ao longo do tempo.",
    icon: <Workflow className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Desempenho",
    description: "Contrastar desempenho do abrigo em diferentes períodos.",
    icon: <Gauge className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Metas",
    description: "Avaliar cumprimento de metas e objetivos do abrigo.",
    icon: <CheckSquare className="h-10 w-10 text-brand-accent" />,
  },
];

function MapSectionIcon() {
  return (
    <svg
      className="h-10 w-10 text-brand-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75 4.5 4.5v13.75l4.75 2.25 5-2.75 4.25 2.25V6.25L14.5 4l-5.5 2.75v13.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75v13.5m5.5-16.25v13.25m4.25-11-4.25-2"
      />
    </svg>
  );
}
