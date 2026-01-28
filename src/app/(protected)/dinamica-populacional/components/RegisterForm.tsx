import type { ChangeEvent, FormEvent, JSX, KeyboardEvent } from "react";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";

import { Text } from "@/components/ui/typography";
import FormError from "@/components/ui/FormError";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
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
  isEditing?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
  editingRowId?: string | null;
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

function RegisterFormInner({
  dynamicType,
  onSubmit,
  isSubmitting,
  isEditing,
  isDeleting,
  onDelete,
  initialValues,
}: RegisterFormProps): JSX.Element {
  const [values, setValues] = useState<RegisterFormValues>(
    initialValues ?? INITIAL_VALUES,
  );
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});

  const currentYear = dayjs().format("YYYY");
  const currentMonth = dayjs().format("MM");

  const monthOptions = useMemo(() => {
    return MONTH_OPTIONS.map((option) => ({
      ...option,
      disabled: values.year === currentYear && option.value > currentMonth,
    }));
  }, [values.year, currentYear, currentMonth]);

  const yearOptions = useMemo(() => {
    return YEAR_OPTIONS.map((option) => ({
      ...option,
      disabled: false,
    }));
  }, []);

  const handleMonthChange = (value: string): void => {
    setValues((current) => ({ ...current, month: value }));
    setFieldErrors((current) => ({ ...current, month: undefined }));
  };

  const handleYearChange = (value: string): void => {
    const isCurrentYear = value === currentYear;
    const currentMonthValue = values.month;

    if (isCurrentYear && currentMonthValue > currentMonth) {
      setValues((current) => ({
        ...current,
        year: value,
        month: currentMonth,
      }));
      setFieldErrors((current) => ({
        ...current,
        year: undefined,
        month: undefined,
      }));
      return;
    }

    setValues((current) => ({ ...current, year: value }));
    setFieldErrors((current) => ({ ...current, year: undefined }));
  };

  const handleIntegerChange =
    (field: keyof RegisterFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const sanitized = event.target.value.replace(/\D+/g, "");
      setValues((current) => ({ ...current, [field]: sanitized }));
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    };
  const preventInvalidKeys = (event: KeyboardEvent<HTMLInputElement>): void => {
    const blocked = ["e", "E", ".", ",", "+", "-"];
    if (blocked.includes(event.key)) {
      event.preventDefault();
    }
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
    onSubmit({ ...parsed.data, dynamicType });
  };
  const handleDeleteConfirm = (): void => {
    if (!onDelete || isDeleting) return;
    void onDelete();
  };
  const handleDeleteRequest = (): void => {
    if (!onDelete || isDeleting) return;
    setConfirmingDelete(true);
  };
  const handleDeleteCancel = (): void => setConfirmingDelete(false);

  const isEditMode = isEditing ?? Boolean(initialValues);

  const renderLabel = (text: string, isRequired = true): JSX.Element => (
    <span className="flex items-center gap-1 text-sm font-semibold text-slate-800">
      <span className="whitespace-pre-line">{text}</span>
      {isRequired && <span className="text-red-600">*</span>}
    </span>
  );

  const renderNumberField = (
    field: keyof RegisterFormValues,
    label: string,
    isRequired = true,
  ): JSX.Element => (
    <label className="flex flex-col gap-1">
      {renderLabel(label, isRequired)}
      <input
        required={isRequired}
        min={0}
        step={1}
        inputMode="numeric"
        pattern="[0-9]*"
        type="text"
        value={values[field]}
        onChange={handleIntegerChange(field)}
        onKeyDown={preventInvalidKeys}
        aria-invalid={Boolean(fieldErrors[field])}
        aria-describedby={
          fieldErrors[field] ? `${String(field)}-error` : undefined
        }
        className={clsx(
          "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30",
          fieldErrors[field] &&
            "border-brand-red focus:border-brand-red focus:ring-brand-red/20",
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
      <div className="relative flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-2">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          {dynamicType === "dinamica_lar"
            ? "Registro para Lar Temporário"
            : "Registro para Abrigo"}
        </Text>
        {isEditMode && onDelete && (
          <div className="relative">
            <button
              type="button"
              onClick={handleDeleteRequest}
              disabled={isDeleting || isSubmitting}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-60"
              aria-label="Excluir registro"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              <span>Excluir</span>
            </button>
            {isConfirmingDelete && (
              <div className="absolute right-0 top-11 z-10 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-semibold text-slate-800">
                  Deseja excluir este registro?
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Esta ação não pode ser desfeita.
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:opacity-70"
                  >
                    {isDeleting ? (
                      <>
                        <span
                          className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-white"
                          aria-hidden
                        />
                        Excluindo...
                      </>
                    ) : (
                      "Excluir"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          {renderLabel("Mês Referência")}
          <SelectDropdown
            options={monthOptions}
            value={values.month}
            onChange={handleMonthChange}
            name="month"
          />
          <FormError id="month-error" message={fieldErrors.month} />
        </div>

        <div className="flex flex-col gap-1">
          {renderLabel("Ano Referência")}
          <SelectDropdown
            options={yearOptions}
            value={values.year}
            onChange={handleYearChange}
            name="year"
          />
          <FormError id="year-error" message={fieldErrors.year} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {numberFields.map(({ field, label }) => (
          <div key={field}>{renderNumberField(field, label)}</div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
        <button
          type="submit"
          disabled={isSubmitting || isDeleting}
          className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export default function RegisterForm(props: RegisterFormProps): JSX.Element {
  const formKey = useMemo(
    () =>
      JSON.stringify({
        values: props.initialValues ?? null,
        editId: props.editingRowId ?? null,
      }),
    [props.initialValues, props.editingRowId],
  );

  return (
    <RegisterFormInner
      key={formKey}
      {...props}
      isSubmitting={props.isSubmitting ?? false}
      isDeleting={props.isDeleting ?? false}
      isEditing={props.isEditing ?? Boolean(props.initialValues)}
    />
  );
}
