import type {
  ShelterProfileFormData,
  ShelterTypeOption,
  SpeciesOption,
} from "@/types/shelter.types";
import { STATE_METADATA } from "@/lib/database/stateMetadata";

export const SHELTER_TYPE_OPTIONS: ShelterTypeOption[] = [
  {
    value: "public",
    label: "Público",
    description:
      "Estabelecimentos da administração pública, sem finalidade comercial, geralmente vinculados a CCZ/UVZ/Canil e Gatil público.",
  },
  {
    value: "private",
    label: "Privado",
    description:
      "Entidades do terceiro setor (ONG, OSC, OSCIP, OS), sem finalidade comercial ou lucrativa.",
  },
  {
    value: "mixed",
    label: "Misto",
    description:
      "Parcerias contratuais entre abrigos públicos e privados, igualmente sem finalidade comercial ou lucrativa.",
  },
  {
    value: "temporary",
    label: "LT/PI",
    description:
      "Protetores independentes ou lares temporários, pessoas físicas que resgatam, recuperam e reintroduzem animais.",
  },
];

export const SPECIES_OPTIONS: SpeciesOption[] = [
  { value: "caes", label: "Cães" },
  { value: "gatos", label: "Gatos" },
  { value: "caes e gatos", label: "Cães e Gatos" },
];

export const ADDITIONAL_SPECIES: SpeciesOption[] = [
  { value: "coelhos", label: "Coelhos" },
  { value: "aves", label: "Aves" },
  { value: "peixes", label: "Peixes" },
  { value: "outros", label: "Outros" },
];

export const ROLES_OPTIONS: SpeciesOption[] = [
  { value: "Gestor", label: "Gestor" },
  { value: "Funcionário", label: "Funcionário" },
  { value: "Voluntário", label: "Voluntário" },
];

export const STATE_OPTIONS = STATE_METADATA;

export const DEFAULT_SHELTER_PROFILE: ShelterProfileFormData = {
  shelterType: "public",
  cnpj: "33.656.764/0001-99",
  name: "TESTE ABRIGO",
  cep: "14806-385",
  street: "Avenida Tereza Pelegrinete Mota",
  number: "2",
  district: "Jardim Roberto Selmi Dei",
  state: "SP",
  city: "Araraquara",
  website: "teste abrigo",
  foundationDate: "20/12/2020",
  species: "caes e gatos",
  additionalSpecies: ["coelhos", "aves", "peixes", "outros"],
  hasTemporaryAgreement: null,
  initialDogs: 5,
  initialCats: 5,
  authorizedName: "Ariovaldo Silva",
  authorizedRole: "Gestor",
  authorizedEmail: "arizoka18@gmail.com",
  authorizedPhone: "(16) 9 9999-9999",
  acceptTerms: true,
};
