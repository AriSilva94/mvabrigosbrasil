"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import Input from "./Input";
import { formatCnpj, formatCpf, formatPhone, formatCep } from "@/lib/formatters";

type MaskType = "cnpj" | "cpf" | "phone" | "cep";

type MaskedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  mask: MaskType;
  onValueChange?: (unmasked: string, masked: string) => void;
};

const maskFunctions: Record<MaskType, (value: string) => string> = {
  cnpj: formatCnpj,
  cpf: formatCpf,
  phone: formatPhone,
  cep: formatCep,
};

const maxLengths: Record<MaskType, number> = {
  cnpj: 18, // 00.000.000/0000-00
  cpf: 14, // 000.000.000-00
  phone: 16, // (00) 0 0000-0000
  cep: 9, // 00000-000
};

const placeholders: Record<MaskType, string> = {
  cnpj: "00.000.000/0000-00",
  cpf: "000.000.000-00",
  phone: "(00) 0 0000-0000",
  cep: "00000-000",
};

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      onValueChange,
      value: controlledValue,
      defaultValue,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(() => {
      const initial = defaultValue?.toString() || "";
      return maskFunctions[mask](initial);
    });

    const value = controlledValue !== undefined ? String(controlledValue) : internalValue;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const rawValue = e.target.value;
      const unmasked = rawValue.replace(/\D/g, "");
      const masked = maskFunctions[mask](rawValue);

      if (controlledValue === undefined) {
        setInternalValue(masked);
      }

      onValueChange?.(unmasked, masked);
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={maxLengths[mask]}
        inputMode="numeric"
        placeholder={placeholder || placeholders[mask]}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export default MaskedInput;
