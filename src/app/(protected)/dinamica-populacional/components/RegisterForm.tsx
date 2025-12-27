import type { ChangeEvent, FormEvent, JSX } from "react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import dayjs from "dayjs";

import { Text } from "@/components/ui/typography";
import FormError from "@/components/ui/FormError";
import { MONTH_OPTIONS, YEAR_OPTIONS } from "../constants";
import type {
  DynamicType,
  RegisterFormSubmit,
  RegisterFormValues,
} from "../types";
import { registerSchema } from "../validations";

type RegisterFormProps = {
  dynamicType: DynamicType;
  onSubmit: (values: RegisterFormSubmit) => void;
  isSubmitting?: boolean;
  initialValues?: RegisterFormValues;
};

const INITIAL_VALUES: RegisterFormValues = {
  month: dayjs().format("MM"),
  year: dayjs().format("YYYY"),
  entries: "0",
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

export default function RegisterForm({
  dynamicType,
  onSubmit,
  isSubmitting = false,
  initialValues,
}: RegisterFormProps): JSX.Element {
  const [values, setValues] = useState<RegisterFormValues>(
    initialValues ?? INITIAL_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});

  const handleChange =
    (field: keyof RegisterFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  useEffect(() => {
    if (initialValues) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues(initialValues);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFieldErrors({});
    }
  }, [initialValues]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Partial<Record<keyof RegisterFormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          errors[path as keyof RegisterFormValues] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit({ ...parsed.data, dynamicType });
  };

  const renderLabel = (text: string, isRequired = true): JSX.Element => (
    <span className="flex items-center gap-1 text-sm font-semibold text-slate-800">
      <span className="whitespace-pre-line">{text}</span>
      {isRequired && <span className="text-red-600">*</span>}
    </span>
  );

  const renderNumberField = (
    field: keyof RegisterFormValues,
    label: string,
    isRequired = true
  ): JSX.Element => (
    <label className="flex flex-col gap-1">
      {renderLabel(label, isRequired)}
      <input
        required={isRequired}
        min={0}
        inputMode="numeric"
        type="number"
        value={values[field]}
        onChange={handleChange(field)}
        aria-invalid={Boolean(fieldErrors[field])}
        aria-describedby={
          fieldErrors[field] ? `${String(field)}-error` : undefined
        }
        className={clsx(
          "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30",
          fieldErrors[field] &&
            "border-brand-red focus:border-brand-red focus:ring-brand-red/20"
        )}
      />
      <FormError id={`${String(field)}-error`} message={fieldErrors[field]} />
    </label>
  );

  const numberFields: Array<{
    field: keyof RegisterFormValues;
    label: string;
  }> = [
    { field: "entries", label: "Entradas de Cães" },
    { field: "entriesCats", label: "Entradas de Gatos" },
    { field: "adoptions", label: "Adoções de Cães" },
    { field: "adoptionsCats", label: "Adoções de Gatos" },
    { field: "returns", label: "Devoluções de Cães" },
    { field: "returnsCats", label: "Devoluções de Gatos" },
    { field: "euthanasias", label: "Eutanásias de Cães" },
    { field: "euthanasiasCats", label: "Eutanásias de Gatos" },
    { field: "naturalDeaths", label: "Mortes Naturais de Cães" },
    { field: "naturalDeathsCats", label: "Mortes Naturais de Gatos" },
    { field: "diseases", label: "Cães Doentes" },
    { field: "diseasesCats", label: "Gatos Doentes" },
    { field: "tutorReturn", label: "Retorno ao Tutor (Cães)" },
    { field: "tutorReturnCats", label: "Retorno ao Tutor (Gatos)" },
    { field: "originReturn", label: "Retorno Local Origem (Cães)" },
    { field: "originReturnCats", label: "Retorno Local Origem (Gatos)" },
  ];

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-2">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          {dynamicType === "dinamica_lar"
            ? "Registro para Lar Temporário"
            : "Registro para Abrigo"}
        </Text>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          {renderLabel("Mês Referência")}
          <select
            value={values.month}
            onChange={handleChange("month")}
            aria-invalid={Boolean(fieldErrors.month)}
            aria-describedby={fieldErrors.month ? "month-error" : undefined}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
            required
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FormError id="month-error" message={fieldErrors.month} />
        </label>

        <label className="flex flex-col gap-1">
          {renderLabel("Ano Referência")}
          <select
            value={values.year}
            onChange={handleChange("year")}
            aria-invalid={Boolean(fieldErrors.year)}
            aria-describedby={fieldErrors.year ? "year-error" : undefined}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
            required
          >
            {YEAR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FormError id="year-error" message={fieldErrors.year} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {numberFields.map(({ field, label }) => (
          <div key={field}>{renderNumberField(field, label)}</div>
        ))}
      </div>

      <div className="pt-2 text-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
