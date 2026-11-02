import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ io: vi.fn() }));
vi.mock("socket.io-client", () => ({ io: mocks.io }));

import {
  CHAT_HEARTBEAT_MS,
  attachSessionRecovery,
  createChatSocket,
  startHeartbeat,
} from "./chatSocket";

type Handler = (...args: unknown[]) => void;

function fakeSocket() {
  const handlers = new Map<string, Handler[]>();
  return {
    connected: true,
    on: vi.fn((event: string, handler: Handler) => {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
    }),
    off: vi.fn((event: string, handler: Handler) => {
      handlers.set(event, (handlers.get(event) ?? []).filter((h) => h !== handler));
    }),
    connect: vi.fn(),
    emit: vi.fn(),
    fire(event: string, ...args: unknown[]) {
      for (const handler of handlers.get(event) ?? []) handler(...args);
    },
  };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.useRealTimers());

describe("createChatSocket", () => {
  it("connects on the same origin under /api/v1 without trailing slash and with cookies", () => {
    mocks.io.mockReturnValue("socket");
    expect(createChatSocket()).toBe("socket");
    expect(mocks.io).toHaveBeenCalledWith({
      path: "/api/v1/socket.io",
      addTrailingSlash: false,
      withCredentials: true,
      autoConnect: false,
      forceNew: true,
    });
  });
});

describe("attachSessionRecovery", () => {
  it("refreshes the session and reconnects when the handshake is unauthorized", async () => {
    const socket = fakeSocket();
    const refresh = vi.fn().mockResolvedValue(undefined);
    attachSessionRecovery(socket as never, refresh);

    socket.fire("connect_error", new Error("unauthorized"));
    await vi.waitFor(() => expect(socket.connect).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("refreshes and reconnects when the server drops the socket at token expiry", async () => {
    const socket = fakeSocket();
    const refresh = vi.fn().mockResolvedValue(undefined);
    attachSessionRecovery(socket as never, refresh);

    socket.fire("disconnect", "io server disconnect");
    await vi.waitFor(() => expect(socket.connect).toHaveBeenCalledTimes(1));
  });

  it("stays disconnected when the session cannot be refreshed", async () => {
    const socket = fakeSocket();
    const refresh = vi.fn().mockRejectedValue(new Error("401"));
    attachSessionRecovery(socket as never, refresh);

    socket.fire("connect_error", new Error("unauthorized"));
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(socket.connect).not.toHaveBeenCalled();
  });

  it("ignores network errors and client-side disconnects", async () => {
    const socket = fakeSocket();
    const refresh = vi.fn().mockResolvedValue(undefined);
    attachSessionRecovery(socket as never, refresh);

    socket.fire("connect_error", new Error("xhr poll error"));
    socket.fire("disconnect", "io client disconnect");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("gives up after 3 recoveries in a row without connecting and resets on connect", async () => {
    const socket = fakeSocket();
    const refresh = vi.fn().mockResolvedValue(undefined);
    attachSessionRecovery(socket as never, refresh);

    for (let i = 0; i < 5; i += 1) {
      socket.fire("connect_error", new Error("unauthorized"));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    expect(refresh).toHaveBeenCalledTimes(3);

    socket.fire("connect");
    socket.fire("connect_error", new Error("unauthorized"));
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(4));
  });

  it("detaches its listeners", () => {
    const socket = fakeSocket();
    const detach = attachSessionRecovery(socket as never, vi.fn());
    detach();
    expect(socket.off).toHaveBeenCalledTimes(3);
  });
});

describe("startHeartbeat", () => {
  it("emits chat:heartbeat every 30 seconds while connected", () => {
    vi.useFakeTimers();
    const socket = fakeSocket();
    const stop = startHeartbeat(socket as never);

    vi.advanceTimersByTime(CHAT_HEARTBEAT_MS * 2);
    expect(socket.emit).toHaveBeenCalledTimes(2);
    expect(socket.emit).toHaveBeenCalledWith("chat:heartbeat");

    stop();
    vi.advanceTimersByTime(CHAT_HEARTBEAT_MS);
    expect(socket.emit).toHaveBeenCalledTimes(2);
  });
});

describe("applyPresenceEvent", () => {
  it("adds online users and removes offline ones without mutating the previous set", async () => {
    const { applyPresenceEvent } = await import("./chatSocket");
    const before = new Set(["a"]);
    const after = applyPresenceEvent(before, { profileId: "b", online: true });
    expect([...after].sort()).toEqual(["a", "b"]);
    expect([...applyPresenceEvent(after, { profileId: "a", online: false })]).toEqual(["b"]);
    expect([...before]).toEqual(["a"]);
  });
});
