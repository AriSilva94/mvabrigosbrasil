import { describe, expect, it, vi } from "vitest";
import { createExclusiveAction } from "./exclusiveAction";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("exclusive vacancy action", () => {
  it("rejects a concurrent click and publishes only the first operation", async () => {
    const pending = deferred<string>();
    const success = vi.fn();
    const settled = vi.fn();
    const action = createExclusiveAction();
    const first = action.run(() => pending.promise, { onSuccess: success, onSettled: settled });
    await expect(action.run(() => Promise.resolve("second"), { onSuccess: success })).resolves.toBe(false);
    pending.resolve("first");
    await expect(first).resolves.toBe(true);
    expect(success).toHaveBeenCalledOnce();
    expect(success).toHaveBeenCalledWith("first");
    expect(settled).toHaveBeenCalledOnce();
  });

  it("suppresses every callback after unmount", async () => {
    const pending = deferred<string>();
    const handlers = { onSuccess: vi.fn(), onError: vi.fn(), onSettled: vi.fn() };
    const action = createExclusiveAction();
    const run = action.run(() => pending.promise, handlers);
    action.dispose();
    pending.resolve("late");
    await run;
    expect(handlers.onSuccess).not.toHaveBeenCalled();
    expect(handlers.onError).not.toHaveBeenCalled();
    expect(handlers.onSettled).not.toHaveBeenCalled();
  });

  it("supports StrictMode dispose then activate with a new action", async () => {
    const action = createExclusiveAction();
    action.activate();
    action.dispose();
    action.activate();

    const onSuccess = vi.fn();
    await expect(
      action.run(() => Promise.resolve("after remount"), { onSuccess }),
    ).resolves.toBe(true);
    expect(onSuccess).toHaveBeenCalledWith("after remount");
  });

  it("does not publish an old action after reactivation or final unmount", async () => {
    const pending = deferred<string>();
    const onSuccess = vi.fn();
    const action = createExclusiveAction();
    action.activate();
    const run = action.run(() => pending.promise, { onSuccess });

    action.dispose();
    action.activate();
    action.dispose();
    pending.resolve("late old action");
    await run;

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
