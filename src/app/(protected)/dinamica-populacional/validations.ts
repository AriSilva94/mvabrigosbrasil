import { z } from "zod";

import { MONTH_OPTIONS, YEAR_OPTIONS } from "./constants";

const monthEnum = z.enum(MONTH_OPTIONS.map((option) => option.value) as [string, ...string[]]);
const yearEnum = z.enum(YEAR_OPTIONS.map((option) => option.value) as [string, ...string[]]);

const numberField = z.preprocess((value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return 0;
    return Number(trimmed);
  }
  return value;
}, z.number().int("Use apenas números inteiros.").min(0, "Informe um valor maior ou igual a zero."));

export const registerSchema = z.object({
  month: monthEnum,
  year: yearEnum,
  entries: numberField,
  entriesCats: numberField,
  adoptions: numberField,
  adoptionsCats: numberField,
  returns: numberField,
  returnsCats: numberField,
  euthanasias: numberField,
  euthanasiasCats: numberField,
  naturalDeaths: numberField,
  naturalDeathsCats: numberField,
  diseases: numberField,
  diseasesCats: numberField,
  tutorReturn: numberField,
  tutorReturnCats: numberField,
  originReturn: numberField,
  originReturnCats: numberField,
});

export type RegisterFormData = z.infer<typeof registerSchema>;
