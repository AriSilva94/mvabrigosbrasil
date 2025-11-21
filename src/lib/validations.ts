// TODO: funções de validação reutilizáveis
export function isRequired(value: unknown) {
  return value !== null && value !== undefined && value !== '';
}
