import type { ShelterProfileInput } from "./shelterProfileSchema";
import type { ShelterProfileFormData } from "@/types/shelter.types";

export type ShelterAddressOverride = {
  street: string;
  district: string;
  city: string;
  state: string;
};

export type ShelterProfileEditorState = {
  isSubmitting: boolean;
  fieldErrors: Partial<Record<keyof ShelterProfileInput, string>>;
  shelterType: string;
  documentValue: string;
  addressDataOverride: ShelterAddressOverride | null;
  isDeactivateDialogOpen: boolean;
  hasDuplicateCep: boolean;
};

export function createShelterProfileEditorState(
  shelter: Partial<ShelterProfileFormData> | null,
): ShelterProfileEditorState {
  return {
    isSubmitting: false,
    fieldErrors: {},
    shelterType: shelter?.shelterType ?? "",
    documentValue: shelter?.cnpj ?? "",
    addressDataOverride: null,
    isDeactivateDialogOpen: false,
    hasDuplicateCep: false,
  };
}
