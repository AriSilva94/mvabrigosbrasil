import type { ShelterProfileFormData } from "@/types/shelter.types";

type PopulationPayload = {
  shelterType: string;
  cnpj: string;
  shelterName: string;
  cep: string;
  street: string;
  number: string | number;
  district: string;
  state: string;
  city: string;
  website: string;
  foundationDate: string;
  species: string;
  additionalSpecies: string[];
  temporaryAgreement?: string;
  initialDogs: FormDataEntryValue | null;
  initialCats: FormDataEntryValue | null;
  authorizedName: string;
  authorizedRole: string;
  authorizedEmail: string;
  authorizedPhone: string;
  acceptTerms: boolean;
};

export function buildPopulationPayload(
  shelter: Partial<ShelterProfileFormData> | null,
  formData: FormData,
): PopulationPayload {
  return {
    shelterType: shelter?.shelterType ?? "",
    cnpj: shelter?.cnpj ?? "",
    shelterName: shelter?.name ?? "",
    cep: shelter?.cep ?? "",
    street: shelter?.street ?? "",
    number: shelter?.number ?? "0",
    district: shelter?.district ?? "",
    state: shelter?.state ?? "",
    city: shelter?.city ?? "",
    website: shelter?.website ?? "",
    foundationDate: shelter?.foundationDate ?? "",
    species: shelter?.species ?? "",
    additionalSpecies: shelter?.additionalSpecies ?? [],
    temporaryAgreement: shelter?.hasTemporaryAgreement ? "sim" : "nao",
    initialDogs: formData.get("initialDogs"),
    initialCats: formData.get("initialCats"),
    authorizedName: shelter?.authorizedName ?? "",
    authorizedRole: shelter?.authorizedRole ?? "",
    authorizedEmail: shelter?.authorizedEmail ?? "",
    authorizedPhone: shelter?.authorizedPhone ?? "",
    acceptTerms: shelter?.acceptTerms ?? true,
  };
}
