import type { JSX, ReactNode } from "react";

type RegisterFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
};

export default function RegisterField({
  id,
  label,
  required,
  children,
}: RegisterFieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-start gap-1 text-sm font-semibold text-[#4f5464]"
      >
        <span>
          {label}
          {required && <span className="text-brand-red"> *</span>}
        </span>
      </label>
      {children}
    </div>
  );
}
