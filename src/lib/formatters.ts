// TODO: funções de formatação reutilizáveis
export function formatDate(value: string | number | Date) {
  const date = new Date(value);
  return date.toISOString();
}
