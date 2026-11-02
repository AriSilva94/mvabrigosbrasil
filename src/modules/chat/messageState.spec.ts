import { describe, expect, it } from "vitest";

import type { ChatMessage } from "@/types/chat.types";
import { prependPage, replaceOptimistic } from "./messageState";

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
