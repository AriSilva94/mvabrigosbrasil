import { z } from "zod";

import { MONTH_OPTIONS } from "./constants";
import type {
  DynamicType,
  RegisterFormSubmit,
  RegisterFormValues,
} from "./types";

const monthEnum = z.enum(MONTH_OPTIONS.map((option) => option.value) as [string, ...string[]]);
const yearEnum = z.string().regex(/^\d{4}$/, "Ano inválido");

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

type RegisterSubmissionResult =
  | { success: true; fieldErrors: Record<string, never> }
  | {
      success: false;
      fieldErrors: Partial<Record<keyof RegisterFormValues, string>>;
    };

export function submitValidRegister(
  values: RegisterFormValues,
  dynamicType: DynamicType,
  submit: (payload: RegisterFormSubmit) => void,
): RegisterSubmissionResult {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof RegisterFormValues, string>> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path[0];
      if (typeof path === "string") {
        fieldErrors[path as keyof RegisterFormValues] = issue.message;
      }
    });
    return { success: false, fieldErrors };
  }

  submit({ ...parsed.data, dynamicType });
  return { success: true, fieldErrors: {} };
}
