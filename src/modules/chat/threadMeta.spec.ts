import { describe, expect, it } from "vitest";

import type { ChatThreadWithMeta } from "@/types/chat.types";
import { resolveCurrentThread } from "./threadMeta";

const thread = (overrides: Partial<ChatThreadWithMeta> = {}): ChatThreadWithMeta => ({
  id: "t1",
  status: "active",
  updated_at: "2026-11-02T10:00:00.000Z",
  volunteer_profile_id: "vol",
  shelter_profile_id: "she",
  vacancy_title: "Cuidador de Cães",
  vacancy_slug: null,
  other_participant_name: "Maria Voluntária",
  last_message: null,
  unread_count: 0,
  ...overrides,
});

describe("resolveCurrentThread", () => {
  it("fills name, vacancy and the counterpart profile for the shelter side", () => {
    expect(resolveCurrentThread([thread()], "t1", "she")).toEqual({
      id: "t1",
      otherName: "Maria Voluntária",
      otherProfileId: "vol",
      vacancyTitle: "Cuidador de Cães",
    });
  });

  it("uses the shelter profile as counterpart for the volunteer side", () => {
    expect(
      resolveCurrentThread([thread({ other_participant_name: "Abrigo Feliz" })], "t1", "vol"),
    ).toMatchObject({ otherName: "Abrigo Feliz", otherProfileId: "she" });
  });

  it("returns null when the thread is not in the list", () => {
    expect(resolveCurrentThread([thread()], "outra", "she")).toBeNull();
  });
});
