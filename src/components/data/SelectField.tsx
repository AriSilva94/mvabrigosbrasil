"use client";

import type { ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";

type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  count?: number;
};

type SelectFieldProps<T extends string | number> = {
  id: string;
  name?: string;
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
  showRequiredAsterisk?: boolean;
};

export default function SelectField<T extends string | number>({
  id,
  name,
  label,
  value,
  options,
  onChange,
  className = "",
  required = false,
  placeholder,
  showRequiredAsterisk = false,
}: SelectFieldProps<T>) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const rawValue = event.target.value;
    const selectedOption = options.find(
      (option) => String(option.value) === rawValue,
    );

    const nextValue = selectedOption?.value ?? (rawValue as T);
    onChange(nextValue);
  }

  return (
    <label
      className={`flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary ${className}`}
    >
      <span className="inline-flex items-center gap-1 font-semibold text-brand-secondary">
        {label}
        {showRequiredAsterisk && <span className="text-red-500">*</span>}
      </span>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={String(value)}
          onChange={handleChange}
          required={required}
          className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-5 pr-12 text-base leading-tight text-slate-800 shadow-sm transition hover:border-brand-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
              {typeof option.count === "number" ? ` (${option.count})` : ""}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
      </div>
    </label>
  );
}
