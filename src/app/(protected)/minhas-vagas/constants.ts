export const PERIOD_OPTIONS = ["Meio Período", "Integral", "Qualquer Período"];

export const WORKLOAD_OPTIONS = [
  "1h por semana",
  "2h por semana",
  "3h por semana",
  "4h por semana",
  "5h por semana",
  "6h por semana",
  "7h por semana",
  "8h por semana",
];

// Mapeamento de valores legados do WordPress para o formato novo
export const WORKLOAD_LEGACY_MAP: Record<string, string> = {
  "1h": "1h por semana",
  "2h": "2h por semana",
  "3h": "3h por semana",
  "4h": "4h por semana",
  "5h": "5h por semana",
  "6h": "6h por semana",
  "7h": "7h por semana",
  "8h": "8h por semana",
};

/**
 * Normaliza valor de carga horária do WordPress para o formato do formulário
 */
export function normalizeWorkload(value?: string | null): string {
  if (!value) return "";
  return WORKLOAD_LEGACY_MAP[value] || value;
}

export const DEMAND_OPTIONS = ["Pontual", "Contínua"];

export const AREA_OPTIONS = [
  "Arquitetura",
  "Contabilidade",
  "Direito",
  "Educação",
  "Engenharia",
  "Marketing",
  "Programador",
  "Saúde",
  "Tecnologia",
  "Veterinária",
  "Outros",
];
