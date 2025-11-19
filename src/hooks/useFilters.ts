export function useFilters<TFilters>() {
  // TODO: gerenciar estado de filtros reutilizável
  return { filters: {} as TFilters, setFilters: (_: Partial<TFilters>) => {} };
}
