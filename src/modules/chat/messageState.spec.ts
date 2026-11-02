import { describe, expect, it } from "vitest";

import type { ChatMessage } from "@/types/chat.types";
import {
  applyMessageUpdate,
  mergeIncomingMessage,
  prependPage,
  replaceOptimistic,
} from "./messageState";

const msg = (id: string, overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id,
  thread_id: "t1",
  sender_id: "other",
  content: id,
  message_type: "text",
  status: "sent",
  deleted_at: null,
  edited_at: null,
  created_at: `2026-11-02T10:00:0${id.length}.000Z`,
  updated_at: `2026-11-02T10:00:0${id.length}.000Z`,
  ...overrides,
});

describe("mergeIncomingMessage", () => {
  it("appends a new message from the other participant", () => {
    expect(mergeIncomingMessage([msg("a")], msg("b"), "me").map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("does not duplicate an id that is already in the list", () => {
    const list = [msg("a")];
    expect(mergeIncomingMessage(list, msg("a"), "me")).toBe(list);
  });

  it("ignores the user's own messages (already handled by the optimistic send)", () => {
    const list = [msg("a")];
    expect(mergeIncomingMessage(list, msg("b", { sender_id: "me" }), "me")).toBe(list);
  });
});

describe("applyMessageUpdate", () => {
  it("updates status, content and edited_at of the matching message", () => {
    const updated = applyMessageUpdate(
      [msg("a"), msg("b")],
      msg("b", { status: "read", content: "novo", edited_at: "2026-11-02T11:00:00.000Z" }),
    );
    expect(updated[1]).toMatchObject({ status: "read", content: "novo", edited_at: "2026-11-02T11:00:00.000Z" });
    expect(updated[0]).toEqual(msg("a"));
  });
});

describe("replaceOptimistic", () => {
  it("swaps the temporary message for the persisted one", () => {
    const real = msg("real", { sender_id: "me" });
    expect(replaceOptimistic([msg("a"), msg("temp-1")], "temp-1", real).map((m) => m.id)).toEqual(["a", "real"]);
  });

  it("drops the temporary one when the real message already arrived", () => {
    const real = msg("real", { sender_id: "me" });
    expect(replaceOptimistic([msg("temp-1"), real], "temp-1", real).map((m) => m.id)).toEqual(["real"]);
  });
});

describe("prependPage", () => {
  it("puts an older page before the current list and removes duplicates", () => {
    expect(prependPage([msg("c"), msg("d")], [msg("a"), msg("b"), msg("c")]).map((m) => m.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});
