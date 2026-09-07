import { describe, expect, it } from "vitest";

import { resolveProfileOverride } from "./profileOverride";

describe("resolveProfileOverride", () => {
  it("uses an edit only while it belongs to the current profile version", () => {
    const override = { profileKey: "old", value: "temporary" };

    expect(resolveProfileOverride(override, "old", "private")).toBe(
      "temporary",
    );
    expect(resolveProfileOverride(override, "updated", "private")).toBe(
      "private",
    );
  });
});
