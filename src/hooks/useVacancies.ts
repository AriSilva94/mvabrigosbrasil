export function useVacancies() {
  // TODO: buscar vagas no Supabase
  return { vacancies: [], isLoading: false, filters: {}, setFilters: () => {} };
}
