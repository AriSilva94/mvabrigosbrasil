import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import {
  isCurrentShelterHistoryRequest,
  shelterHistoryErrorMessage,
} from "./shelterHistoryError";

describe("shelterHistoryErrorMessage", () => {
  it.each([
    [403, "Acesso negado"],
    [500, "Erro ao consultar histórico"],
  ])("preserves the backend message from ApiError %i", (status, message) => {
    expect(shelterHistoryErrorMessage(new ApiError(status, message))).toBe(
      message,
    );
  });

  it.each([new Error("network failed"), "invalid failure", null])(
    "uses the history fallback for an unknown failure %#",
    (error) => {
      expect(shelterHistoryErrorMessage(error)).toBe(
        "Erro ao carregar histórico",
      );
    },
  );

  it.each([
    new DOMException("The operation was aborted", "AbortError"),
    Object.assign(new Error("aborted"), { name: "AbortError" }),
  ])("returns null for an aborted request", (error) => {
    expect(shelterHistoryErrorMessage(error)).toBeNull();
  });
});

describe("isCurrentShelterHistoryRequest", () => {
  it("marks the active request eligible for success and loading updates", () => {
    expect(isCurrentShelterHistoryRequest(3, 3)).toBe(true);
  });

  it("marks stale requests ineligible for success and loading updates", () => {
    expect(isCurrentShelterHistoryRequest(2, 3)).toBe(false);
  });
});
