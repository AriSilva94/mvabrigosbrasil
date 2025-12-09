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

export type RegisterFormValues = {
  month: string;
  year: string;
  entries: string;
  adoptions: string;
  returns: string;
  euthanasias: string;
  naturalDeaths: string;
  diseases: string;
  tutorReturn: string;
  originReturn: string;
};

export type RegisterFormData = {
  month: string;
  year: string;
  entries: number;
  adoptions: number;
  returns: number;
  euthanasias: number;
  naturalDeaths: number;
  diseases: number;
  tutorReturn: number;
  originReturn: number;
};
