import { describe, expect, it, vi } from "vitest";

import { createDynamicsOperationCoordinator } from "./dynamicsOperationCoordinator";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createHarness() {
  const flags = {
    isLoading: false,
    isSaving: false,
    isDeleting: false,
  };
  const published: string[] = [];
  const settled: string[] = [];
  const errors: string[] = [];
  const coordinator = createDynamicsOperationCoordinator({
    setFlags: (next) => Object.assign(flags, next),
  });

  const run = (kind: "get" | "save" | "delete", operation: Promise<string>) =>
    coordinator.run(kind, () => operation, {
      onSuccess: (value) => published.push(value),
      onError: (error) => errors.push(String(error)),
      onSettled: () => settled.push(kind),
    });

  return { coordinator, errors, flags, published, run, settled };
}

describe("dynamics operation coordinator", () => {
  it("transfers ownership from a pending GET to save and ignores the stale GET", async () => {
    const get = deferred<string>();
    const save = deferred<string>();
    const harness = createHarness();

    const getRun = harness.run("get", get.promise);
    expect(harness.flags).toEqual({ isLoading: true, isSaving: false, isDeleting: false });

    const saveRun = harness.run("save", save.promise);
    expect(harness.flags).toEqual({ isLoading: false, isSaving: true, isDeleting: false });

    get.resolve("old GET");
    await getRun;
    expect(harness.flags.isSaving).toBe(true);
    expect(harness.published).toEqual([]);
    expect(harness.settled).toEqual([]);

    save.resolve("saved");
    await saveRun;
    expect(harness.flags).toEqual({ isLoading: false, isSaving: false, isDeleting: false });
    expect(harness.published).toEqual(["saved"]);
    expect(harness.settled).toEqual(["save"]);
  });

  it("transfers ownership from a pending GET to delete and lets delete close the modal", async () => {
    const get = deferred<string>();
    const deletion = deferred<string>();
    const harness = createHarness();

    const getRun = harness.run("get", get.promise);
    const deleteRun = harness.run("delete", deletion.promise);
    expect(harness.flags).toEqual({ isLoading: false, isSaving: false, isDeleting: true });

    deletion.reject(new Error("delete failed"));
    await deleteRun;
    expect(harness.flags).toEqual({ isLoading: false, isSaving: false, isDeleting: false });
    expect(harness.errors).toEqual(["Error: delete failed"]);
    expect(harness.settled).toEqual(["delete"]);

    get.resolve("old GET");
    await getRun;
    expect(harness.published).toEqual([]);
  });

  it("gives a new context ownership and suppresses callbacks from its previous write", async () => {
    const save = deferred<string>();
    const nextGet = deferred<string>();
    const harness = createHarness();
    const saveRun = harness.run("save", save.promise);

    harness.coordinator.invalidateContext();
    expect(harness.flags).toEqual({ isLoading: false, isSaving: false, isDeleting: false });
    const getRun = harness.run("get", nextGet.promise);
    expect(harness.flags).toEqual({ isLoading: true, isSaving: false, isDeleting: false });

    save.resolve("old shelter save");
    await saveRun;
    expect(harness.published).toEqual([]);
    expect(harness.settled).toEqual([]);
    expect(harness.flags.isLoading).toBe(true);

    nextGet.resolve("new shelter GET");
    await getRun;
    expect(harness.flags).toEqual({ isLoading: false, isSaving: false, isDeleting: false });
    expect(harness.published).toEqual(["new shelter GET"]);
    expect(harness.settled).toEqual(["get"]);
  });

  it("prevents all callbacks and state publication after disposal", async () => {
    const save = deferred<string>();
    const setFlags = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onSettled = vi.fn();
    const coordinator = createDynamicsOperationCoordinator({ setFlags });
    const run = coordinator.run("save", () => save.promise, {
      onSuccess,
      onError,
      onSettled,
    });

    coordinator.dispose();
    setFlags.mockClear();
    save.resolve("late save");
    await run;

    expect(setFlags).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onSettled).not.toHaveBeenCalled();
  });
});
