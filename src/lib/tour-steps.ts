import type { Tour } from "nextstepjs";

export const tours: Tour[] = [
  {
    tour: "home-tour",
    steps: [
      {
        icon: "✨",
        title: "Estamos de cara nova!",
        content:
          "Bem-vindo à nova plataforma do Medicina de Abrigos Brasil! Redesenhamos tudo para oferecer uma experiência mais moderna e intuitiva. Vamos conhecer?",
        selector: "#tour-header",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 0,
        pointerRadius: 0,
      },
      {
        icon: "🏠",
        title: "Nossa Logo",
        content:
          "Clique aqui a qualquer momento para voltar à página inicial. Nossa identidade visual representa o cuidado e carinho com os animais de abrigo.",
        selector: "#tour-logo",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 8,
      },
      {
        icon: "📚",
        title: "Menu Principal",
        content:
          "Explore nosso conteúdo: Banco de Dados com mapa interativo, Programa de Voluntários, Biblioteca técnica, Matérias e Relatórios. Tudo ao seu alcance!",
        selector: "#tour-main-nav",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "🔐",
        title: "Área Restrita",
        content:
          "Abrigos e voluntários cadastrados podem acessar a área exclusiva para gerenciar seu perfil, vagas e muito mais. Faça login ou cadastre-se!",
        selector: "#tour-auth-button",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 20,
      },
    ],
  },
  {
    tour: "painel-tour",
    steps: [
      {
        icon: "🐾",
        title: "Bem-vindo ao novo Painel!",
        content:
          "Que bom ter você aqui! Vamos fazer um tour rápido pelas principais funcionalidades da plataforma.",
        selector: "#tour-welcome",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 12,
      },
      {
        icon: "🎓",
        title: "Treinamentos",
        content:
          "Novo por aqui? Assista aos treinamentos para entender como a plataforma funciona e aproveitar ao máximo os recursos disponíveis.",
        selector: "#tour-training-banner",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: "🏠",
        title: "Atalhos Rápidos",
        content:
          "Aqui estão os principais atalhos para navegar pela plataforma. Cada card leva você diretamente para uma funcionalidade específica.",
        selector: "#tour-shortcuts",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 16,
      },
      {
        icon: "📝",
        title: "Meu Cadastro",
        content:
          "Mantenha seus dados sempre atualizados! Clique aqui para revisar e editar as informações do seu perfil.",
        selector: "#tour-profile-shortcut",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
    ],
  },
  {
    tour: "dinamica-populacional-tour",
    steps: [
      {
        icon: "📊",
        title: "Dinâmica Populacional",
        content:
          "Bem-vindo à Dinâmica Populacional! Aqui você registra e acompanha toda a movimentação de animais: entradas, saídas, adoções, óbitos e indicadores de saúde. Vamos entender cada seção?",
        selector: "#tour-dp-header",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 12,
      },
      {
        icon: "📈",
        title: "Taxas e Indicadores",
        content:
          "Estas são as 5 taxas principais do seu abrigo: Entrada, Saída, Adoção, Mortalidade e Morbidade. Elas são calculadas automaticamente a partir dos registros mensais. As setas indicam a tendência (aumento ou redução).",
        selector: "#tour-dp-stats",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: "📋",
        title: "Tabela de Registros",
        content:
          "A tabela mostra os registros mês a mês. As cores indicam o tipo de movimentação: Verde = entradas (aumenta população), Vermelho = saídas (reduz população), Amarelo = indicadores (não altera população). Você pode alternar entre visualização em Tabela e Grid.",
        selector: "#tour-dp-table",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: "📖",
        title: "Glossário",
        content:
          "Tem dúvidas sobre algum termo? O Glossário explica cada conceito usado na página: entradas, devoluções, adoções, eutanásias, mortes naturais, doenças e os tipos de abrigo.",
        selector: "#tour-dp-glossary",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: "🏠",
        title: "Dinâmica L.T. (Lar Temporário)",
        content:
          "Esta seção é dedicada aos Lares Temporários e Protetores Independentes. Funciona da mesma forma que a dinâmica principal, mas registra separadamente os animais em lares temporários.",
        selector: "#tour-dp-lt",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 16,
      },
    ],
  },
  {
    tour: "meu-cadastro-tour",
    steps: [
      {
        icon: "🐕",
        title: "Seu Cadastro",
        content:
          "Aqui você pode visualizar e atualizar todas as informações do seu perfil. Manter os dados atualizados ajuda na conexão com abrigos e voluntários.",
        selector: "#tour-profile-form",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 16,
      },
      {
        icon: "✏️",
        title: "Dados do Formulário",
        content:
          "Preencha todos os campos obrigatórios (marcados com *) para manter seu cadastro completo e válido.",
        selector: "#tour-form-section",
        side: "right",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: "💾",
        title: "Salvar Alterações",
        content:
          "Após fazer qualquer alteração, não esqueça de clicar em 'Salvar Cadastro' para confirmar as mudanças.",
        selector: "#tour-save-button",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 24,
      },
    ],
  },
];

export const TOUR_STORAGE_KEY = "mvabrigosbrasil-tour-completed";

export function getTourStorageKey(userId?: string | null): string {
  return userId ? `${TOUR_STORAGE_KEY}-${userId}` : TOUR_STORAGE_KEY;
}

export type TourName = "home-tour" | "painel-tour" | "dinamica-populacional-tour" | "meu-cadastro-tour";
