import { describe, expect, it, vi } from "vitest";

import { createAuthStateCoordinator } from "@/lib/auth/authState";

type TestUser = { id: string };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe("createAuthStateCoordinator", () => {
  it("deduplicates simultaneous non-forced initial loads", async () => {
    const pending = deferred<TestUser>();
    const requestUser = vi.fn(() => pending.promise);
    const authState = createAuthStateCoordinator(requestUser);

    const first = authState.load();
    const second = authState.load();

    expect(requestUser).toHaveBeenCalledTimes(1);
    pending.resolve({ id: "user-1" });

    await expect(Promise.all([first, second])).resolves.toEqual([
      { id: "user-1" },
      { id: "user-1" },
    ]);
    expect(authState.getSnapshot()).toEqual({
      user: { id: "user-1" },
      isLoading: false,
    });
  });

  it("starts a forced load and ignores an older response", async () => {
    const initial = deferred<TestUser>();
    const fresh = deferred<TestUser>();
    const requestUser = vi
      .fn<() => Promise<TestUser>>()
      .mockReturnValueOnce(initial.promise)
      .mockReturnValueOnce(fresh.promise);
    const authState = createAuthStateCoordinator(requestUser);

    const initialLoad = authState.load();
    const forcedLoad = authState.refresh();

    expect(requestUser).toHaveBeenCalledTimes(2);

    fresh.resolve({ id: "fresh-user" });
    await expect(forcedLoad).resolves.toEqual({ id: "fresh-user" });

    initial.resolve({ id: "stale-user" });
    await initialLoad;

    expect(authState.getSnapshot()).toEqual({
      user: { id: "fresh-user" },
      isLoading: false,
    });
  });

  it("clears cached auth only after logout succeeds", async () => {
    const refresh = deferred<TestUser>();
    const logoutRequest = deferred<unknown>();
    const requestUser = vi
      .fn<() => Promise<TestUser>>()
      .mockResolvedValueOnce({ id: "current-user" })
      .mockReturnValueOnce(refresh.promise);
    const authState = createAuthStateCoordinator(requestUser);

    await authState.load();
    const outstandingRefresh = authState.refresh();
    const logout = authState.logout(() => logoutRequest.promise);

    await authState.load();
    expect(requestUser).toHaveBeenCalledTimes(2);

    logoutRequest.resolve({ ok: true });
    await expect(logout).resolves.toBeUndefined();
    expect(authState.getSnapshot()).toEqual({
      user: null,
      isLoading: false,
    });

    refresh.resolve({ id: "stale-user" });
    await outstandingRefresh;
    expect(authState.getSnapshot()).toEqual({
      user: null,
      isLoading: false,
    });

    await expect(authState.load()).resolves.toBeNull();
    expect(requestUser).toHaveBeenCalledTimes(2);
  });

  it("restores cached auth when logout fails and ignores stale responses", async () => {
    const staleRefresh = deferred<TestUser>();
    const recoveryRefresh = deferred<TestUser>();
    const logoutRequest = deferred<unknown>();
    const requestUser = vi
      .fn<() => Promise<TestUser>>()
      .mockResolvedValueOnce({ id: "current-user" })
      .mockReturnValueOnce(staleRefresh.promise)
      .mockReturnValueOnce(recoveryRefresh.promise);
    const authState = createAuthStateCoordinator(requestUser);

    await authState.load();
    const outstandingRefresh = authState.refresh();
    const logout = authState.logout(() => logoutRequest.promise);

    await expect(authState.load()).resolves.toEqual({ id: "current-user" });
    expect(requestUser).toHaveBeenCalledTimes(2);

    logoutRequest.reject(new Error("network failure"));
    await expect(logout).rejects.toThrow("network failure");
    expect(authState.getSnapshot()).toEqual({
      user: { id: "current-user" },
      isLoading: false,
    });

    staleRefresh.resolve({ id: "stale-user" });
    await outstandingRefresh;
    expect(authState.getSnapshot().user).toEqual({ id: "current-user" });

    await expect(authState.load()).resolves.toEqual({ id: "current-user" });
    const recovery = authState.refresh();
    expect(requestUser).toHaveBeenCalledTimes(3);
    recoveryRefresh.resolve({ id: "recovered-user" });
    await expect(recovery).resolves.toEqual({ id: "recovered-user" });
    expect(authState.getSnapshot().user).toEqual({ id: "recovered-user" });
  });

  it("settles rejected loads and permits a later retry", async () => {
    const failed = deferred<TestUser>();
    const retry = deferred<TestUser>();
    const requestUser = vi
      .fn<() => Promise<TestUser>>()
      .mockReturnValueOnce(failed.promise)
      .mockReturnValueOnce(retry.promise);
    const authState = createAuthStateCoordinator(requestUser);

    const firstLoad = authState.load();
    failed.reject(new Error("unavailable"));

    await expect(firstLoad).resolves.toBeNull();
    expect(authState.getSnapshot()).toEqual({
      user: null,
      isLoading: false,
    });

    const retryLoad = authState.load();
    expect(requestUser).toHaveBeenCalledTimes(2);
    expect(authState.getSnapshot()).toEqual({ user: null, isLoading: true });

    retry.resolve({ id: "user-after-retry" });
    await expect(retryLoad).resolves.toEqual({ id: "user-after-retry" });
    expect(authState.getSnapshot()).toEqual({
      user: { id: "user-after-retry" },
      isLoading: false,
    });
  });

  it("does not notify an unsubscribed consumer after a late load", async () => {
    const pending = deferred<TestUser>();
    const authState = createAuthStateCoordinator(() => pending.promise);
    const listener = vi.fn();
    const unsubscribe = authState.subscribe(listener);

    const load = authState.load();
    unsubscribe();
    pending.resolve({ id: "user-1" });
    await load;

    expect(listener).not.toHaveBeenCalled();
  });
});
