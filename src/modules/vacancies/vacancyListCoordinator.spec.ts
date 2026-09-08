import { describe, expect, it, vi } from "vitest";

import { createVacancyListCoordinator } from "./vacancyListCoordinator";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("vacancy list coordinator", () => {
  it("does not resurrect a vacancy when an older refresh resolves after delete", async () => {
    let items = [{ id: "v1" }, { id: "v2" }];
    const refresh = deferred<typeof items>();
    const coordinator = createVacancyListCoordinator<{ id: string }>({
      setItems: (update) => { items = update(items); },
      setRefreshing: vi.fn(),
      onRefreshError: vi.fn(),
    });

    const pending = coordinator.refresh(() => refresh.promise);
    coordinator.remove("v1");
    refresh.resolve([{ id: "v1" }, { id: "v2" }]);
    await pending;

    expect(items).toEqual([{ id: "v2" }]);
  });

  it("allows a new refresh after a locally created vacancy", async () => {
    let items = [{ id: "v1" }];
    const refreshed = deferred<typeof items>();
    const coordinator = createVacancyListCoordinator<{ id: string }>({
      setItems: (update) => { items = update(items); },
      setRefreshing: vi.fn(),
      onRefreshError: vi.fn(),
    });

    coordinator.prepend({ id: "v2" });
    const pending = coordinator.refresh(() => refreshed.promise);
    refreshed.resolve([{ id: "v2" }, { id: "v1" }, { id: "v3" }]);
    await pending;

    expect(items).toEqual([{ id: "v2" }, { id: "v1" }, { id: "v3" }]);
  });
});
