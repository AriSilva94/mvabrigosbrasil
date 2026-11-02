import { describe, expect, it } from "vitest";

import {
  publishShelterProfile,
  resolveProfileOverride,
} from "./profileOverride";

describe("resolveProfileOverride", () => {
  it("uses an edit only while it belongs to the current profile version", () => {
    const override = { profileRevision: 1, value: "temporary" };

    expect(resolveProfileOverride(override, 1, "private")).toBe(
      "temporary",
    );
    expect(resolveProfileOverride(override, 2, "private")).toBe(
      "private",
    );
  });

  it("assigns a new revision when profile content returns to an earlier value", () => {
    const oldProfile = { active: true };
    const first = publishShelterProfile(0, oldProfile);
    const updated = publishShelterProfile(first.revision, { active: false });
    const restored = publishShelterProfile(updated.revision, oldProfile);
    const staleOverride = {
      profileRevision: first.revision,
      value: "unsaved address",
    };

    expect([first.revision, updated.revision, restored.revision]).toEqual([
      1, 2, 3,
    ]);
    expect(
      resolveProfileOverride(
        staleOverride,
        restored.revision,
        "loaded address",
      ),
    ).toBe("loaded address");
  });
});
