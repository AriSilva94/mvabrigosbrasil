export type GlossaryEntry = {
  term: string;
  definition: string;
};

export type GlossarySection = {
  title: string;
  entries: GlossaryEntry[];
};

export type SelectOption = {
  label: string;
  value: string;
};

export type DynamicType = "dinamica" | "dinamica_lar";

export type RegisterFormValues = {
  month: string;
  year: string;
  entries: string;
  entriesCats: string;
  adoptions: string;
  adoptionsCats: string;
  returns: string;
  returnsCats: string;
  euthanasias: string;
  euthanasiasCats: string;
  naturalDeaths: string;
  naturalDeathsCats: string;
  diseases: string;
  diseasesCats: string;
  tutorReturn: string;
  tutorReturnCats: string;
  originReturn: string;
  originReturnCats: string;
};

export type RegisterFormData = {
  month: string;
  year: string;
  entries: number;
  entriesCats: number;
  adoptions: number;
  adoptionsCats: number;
  returns: number;
  returnsCats: number;
  euthanasias: number;
  euthanasiasCats: number;
  naturalDeaths: number;
  naturalDeathsCats: number;
  diseases: number;
  diseasesCats: number;
  tutorReturn: number;
  tutorReturnCats: number;
  originReturn: number;
  originReturnCats: number;
};

export type RegisterFormSubmit = RegisterFormData & {
  dynamicType: DynamicType;
};

export type PopulationUserSummary = {
  displayName: string | null;
  totalAnimals: number | null;
  shelterTypeLabel: string | null;
  dogsCount: number | null;
  catsCount: number | null;
};

export type RateTrend = "up" | "down" | "neutral";

export type RateCardData = {
  key: "entry" | "exit" | "adoption" | "mortality" | "morbidity";
  label: string;
  value: number | null;
  trend: RateTrend;
  helperText?: string | null;
};

export type DynamicsTableRow = {
  id: string;
  referenceLabel: string;
  referenceDate?: string | null;
  metrics: {
    entriesDogs: number | null;
    entriesCats: number | null;
    returnsDogs: number | null;
    returnsCats: number | null;
    adoptionsDogs: number | null;
    adoptionsCats: number | null;
    euthanasiasDogs: number | null;
    euthanasiasCats: number | null;
    naturalDeathsDogs: number | null;
    naturalDeathsCats: number | null;
    diseasesDogs: number | null;
    diseasesCats: number | null;
    tutorReturnDogs: number | null;
    tutorReturnCats: number | null;
    originReturnDogs: number | null;
    originReturnCats: number | null;
  };
  balance: number | null;
};

export type DynamicsDisplay = {
  dynamicType: DynamicType;
  title: string;
  populationInitial: number | null;
  populationCurrent: number | null;
  populationInitialDogs?: number | null;
  populationInitialCats?: number | null;
  stats: RateCardData[];
  rows: DynamicsTableRow[];
};
