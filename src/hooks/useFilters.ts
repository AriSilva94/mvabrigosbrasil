export function useFilters<TFilters>() {
  return {
    filters: {} as TFilters,
    setFilters: (filters: Partial<TFilters>) => {
      void filters;
    },
  };
}
