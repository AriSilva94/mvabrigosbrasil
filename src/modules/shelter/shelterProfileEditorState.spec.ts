import { describe, expect, it } from "vitest";

import { createShelterProfileEditorState } from "./shelterProfileEditorState";

describe("createShelterProfileEditorState", () => {
  it("starts a new profile revision without validation state from the previous edit", () => {
    const previous = createShelterProfileEditorState({
      shelterType: "private",
      cnpj: "12.345.678/0001-90",
    });
    previous.fieldErrors.shelterName = "Nome obrigatório";
    previous.hasDuplicateCep = true;
    previous.isDeactivateDialogOpen = true;
    previous.isSubmitting = true;

    const next = createShelterProfileEditorState({
      shelterType: "public",
      cnpj: "",
    });

    expect(next).toEqual({
      isSubmitting: false,
      fieldErrors: {},
      shelterType: "public",
      documentValue: "",
      addressDataOverride: null,
      isDeactivateDialogOpen: false,
      hasDuplicateCep: false,
    });
  });
});
