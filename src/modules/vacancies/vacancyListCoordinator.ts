import { LatestRequest } from "@/lib/async/latestRequest";

type ItemUpdate<T extends { id: string }> = (items: T[]) => T[];

type VacancyListCoordinatorOptions<T extends { id: string }> = {
  setItems: (update: ItemUpdate<T>) => void;
  setRefreshing: (refreshing: boolean) => void;
  onRefreshError: (error: unknown) => void;
};

export function createVacancyListCoordinator<T extends { id: string }>({
  setItems,
  setRefreshing,
  onRefreshError,
}: VacancyListCoordinatorOptions<T>) {
  const refreshRequests = new LatestRequest();

  function mutate(update: ItemUpdate<T>) {
    refreshRequests.invalidate();
    setRefreshing(false);
    setItems(update);
  }

  return {
    async refresh(operation: () => Promise<T[]>) {
      setRefreshing(true);
      return refreshRequests.run(operation, {
        onSuccess: (items) => setItems(() => items),
        onError: onRefreshError,
        onSettled: () => setRefreshing(false),
      });
    },
    prepend(item: T) {
      mutate((items) => [item, ...items]);
    },
    remove(itemId: string) {
      mutate((items) => items.filter((item) => item.id !== itemId));
    },
    dispose() {
      refreshRequests.invalidate();
    },
  };
}
