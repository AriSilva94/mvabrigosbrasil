// Dicionário de normalização: mapeia valores do banco -> valor padronizado
export const PERIOD_NORMALIZATION: Record<string, string> = {
  "Matutino": "manhã",
  "Vespertino": "tarde",
  "Noturno": "noite",
  "Integral": "integral",
  "Meio Período": "meio-periodo",
  "Qualquer Período": "flexível",
  "Flexível": "flexível",
} as const;

export const WORKLOAD_NORMALIZATION: Record<string, string> = {
  "1h": "1h",
  "2h": "2h",
  "3h": "3h",
  "4h": "4h",
  "5h": "5h",
  "8h": "8h",
  "12h": "12h",
  "20h": "20h",
  "40h": "40h",
  "Flexível": "flexível",
} as const;

// Função para normalizar valores
export function normalizePeriod(value: string | null | undefined): string {
  if (!value) return "";
  return PERIOD_NORMALIZATION[value] || value.toLowerCase();
}

export function normalizeWorkload(value: string | null | undefined): string {
  if (!value) return "";
  return WORKLOAD_NORMALIZATION[value] || value.toLowerCase();
}

// Filtros para a UI
export const VACANCY_STATE_FILTERS = [
  { value: "", label: "Todos os Estados" },
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;

export const VACANCY_PERIOD_FILTERS = [
  { value: "", label: "Todos os Períodos" },
  { value: "manhã", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "integral", label: "Integral" },
  { value: "meio-periodo", label: "Meio Período" },
  { value: "flexível", label: "Flexível" },
] as const;

export const VACANCY_WORKLOAD_FILTERS = [
  { value: "", label: "Todas as Cargas Horárias" },
  { value: "1h", label: "1h" },
  { value: "2h", label: "2h" },
  { value: "3h", label: "3h" },
  { value: "4h", label: "4h" },
  { value: "5h", label: "5h" },
  { value: "8h", label: "8h" },
  { value: "12h", label: "12h" },
  { value: "20h", label: "20h" },
  { value: "40h", label: "40h" },
  { value: "flexível", label: "Flexível" },
] as const;
