import { describe, expect, it } from "vitest";

import { LatestRequest, LatestRequestScope } from "./latestRequest";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("LatestRequest", () => {
  it("allows only the newest overlapping request to publish state", () => {
    const requests = new LatestRequest();
    const first = requests.begin();
    const second = requests.begin();

    expect(requests.isCurrent(first)).toBe(false);
    expect(requests.isCurrent(second)).toBe(true);
  });

  it("invalidates the active request when input state is cleared", () => {
    const requests = new LatestRequest();
    const active = requests.begin();

    requests.invalidate();

    expect(requests.isCurrent(active)).toBe(false);
  });

  it("publishes success, error and settled state only for the newest operation", async () => {
    const requests = new LatestRequest();
    const first = deferred<string>();
    const second = deferred<string>();
    const state = { data: "", error: "", loading: true };
    const handlers = {
      onSuccess: (data: string) => {
        state.data = data;
      },
      onError: (error: unknown) => {
        state.error = String(error);
      },
      onSettled: () => {
        state.loading = false;
      },
    };

    const staleRun = requests.run(() => first.promise, handlers);
    const currentRun = requests.run(() => second.promise, handlers);
    second.resolve("newest");
    await currentRun;
    first.reject(new Error("stale failure"));
    await staleRun;

    expect(state).toEqual({ data: "newest", error: "", loading: false });
  });
});

describe("LatestRequestScope", () => {
  it("prevents a pending operation from publishing after disposal", async () => {
    const scope = new LatestRequestScope();
    const request = deferred<string>();
    const published: string[] = [];

    const pending = scope.requests.run(() => request.promise, {
      onSuccess: (value) => published.push(value),
      onSettled: () => published.push("settled"),
    });

    scope.dispose();
    request.resolve("stale");
    await pending;

    expect(published).toEqual([]);
  });
});
