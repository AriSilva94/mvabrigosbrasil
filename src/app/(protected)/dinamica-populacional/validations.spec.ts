import { describe, expect, it, vi } from "vitest";

import { submitValidRegister } from "./validations";

const validValues = {
  month: "01",
  year: "2026",
  entries: "1",
  entriesCats: "0",
  adoptions: "0",
  adoptionsCats: "0",
  returns: "0",
  returnsCats: "0",
  euthanasias: "0",
  euthanasiasCats: "0",
  naturalDeaths: "0",
  naturalDeathsCats: "0",
  diseases: "0",
  diseasesCats: "0",
  tutorReturn: "0",
  tutorReturnCats: "0",
  originReturn: "0",
  originReturnCats: "0",
};

describe("submitValidRegister", () => {
  it("does not call submit for invalid values", () => {
    const submit = vi.fn();

    const result = submitValidRegister(
      { ...validValues, month: "13" },
      "dinamica",
      submit,
    );

    expect(result.success).toBe(false);
    expect(submit).not.toHaveBeenCalled();
  });

  it("normalizes and submits valid values", () => {
    const submit = vi.fn();

    const result = submitValidRegister(validValues, "dinamica", submit);

    expect(result).toEqual({ success: true, fieldErrors: {} });
    expect(submit).toHaveBeenCalledWith({
      ...Object.fromEntries(
        Object.keys(validValues)
          .filter((key) => key !== "month" && key !== "year")
          .map((key) => [key, key === "entries" ? 1 : 0]),
      ),
      month: "01",
      year: "2026",
      dynamicType: "dinamica",
    });
  });
});
