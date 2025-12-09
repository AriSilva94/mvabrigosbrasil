import { z } from "zod";

import { MONTH_OPTIONS, YEAR_OPTIONS } from "./constants";

const monthEnum = z.enum(MONTH_OPTIONS.map((option) => option.value) as [string, ...string[]]);
const yearEnum = z.enum(YEAR_OPTIONS.map((option) => option.value) as [string, ...string[]]);

const numberField = z.preprocess((value) => {
  if (typeof value === "string") return value.trim();
  return value;
}, z.string().min(1, "Campo obrigatório.").transform((value) => Number(value)).refine(
  (numberValue) => !Number.isNaN(numberValue) && numberValue >= 0,
  "Informe um valor maior ou igual a zero."
));

export const registerSchema = z.object({
  month: monthEnum,
  year: yearEnum,
  entries: numberField,
  adoptions: numberField,
  returns: numberField,
  euthanasias: numberField,
  naturalDeaths: numberField,
  diseases: numberField,
  tutorReturn: numberField,
  originReturn: numberField,
});

export type RegisterFormData = z.infer<typeof registerSchema>;
