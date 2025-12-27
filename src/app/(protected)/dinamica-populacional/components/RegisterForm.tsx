import type { ChangeEvent, FormEvent, JSX } from "react";
import { useState } from "react";
import clsx from "clsx";

import { Text } from "@/components/ui/typography";
import FormError from "@/components/ui/FormError";
import { MONTH_OPTIONS, YEAR_OPTIONS } from "../constants";
import type { RegisterFormValues } from "../types";
import { registerSchema, type RegisterFormData } from "../validations";

type RegisterFormProps = {
  onSubmit: (values: RegisterFormData) => void;
};

const INITIAL_VALUES: RegisterFormValues = {
  month: "12",
  year: "2025",
  entries: "",
  adoptions: "",
  returns: "",
  euthanasias: "",
  naturalDeaths: "",
  diseases: "",
  tutorReturn: "",
  originReturn: "",
};

export default function RegisterForm({
  onSubmit,
}: RegisterFormProps): JSX.Element {
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
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
    onSubmit(parsed.data);
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
    { field: "adoptions", label: "Adoções de Cães" },
    { field: "returns", label: "Devoluções de Cães" },
    { field: "euthanasias", label: "Eutanásias de Cães" },
    { field: "naturalDeaths", label: "Mortes Naturais de Cães" },
    { field: "diseases", label: "Cães Doentes" },
    { field: "tutorReturn", label: "Retorno ao Tutor\nCães" },
    { field: "originReturn", label: "Retorno Local Origem\nCães" },
  ];

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
          className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
