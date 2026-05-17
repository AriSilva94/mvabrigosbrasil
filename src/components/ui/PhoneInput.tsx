"use client";

import React, { forwardRef } from "react";

interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className = "", ...props }, ref) => {
    const applyPhoneMask = (rawValue: string): string => {
      const numbers = rawValue.replace(/\D/g, "");

      const limitedNumbers = numbers.slice(0, 11);

      if (limitedNumbers.length === 0) {
        return "";
      } else if (limitedNumbers.length <= 2) {
        return `(${limitedNumbers}`;
      } else if (limitedNumbers.length <= 3) {
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
      } else if (limitedNumbers.length <= 7) {
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 3)} ${limitedNumbers.slice(3)}`;
      } else if (limitedNumbers.length <= 10) {
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
      } else {
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 3)} ${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7, 11)}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = applyPhoneMask(e.target.value);
      onChange(maskedValue);
    };

    return (
      <input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        className={`
          px-4 py-3 rounded-lg border border-slate-200 w-full text-base text-[#4f5464]
          bg-white placeholder:text-[#a0a6b1]
          focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-slate-500
          transition
          ${className}
        `}
        {...props}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export function removePhoneMask(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidPhone(phone: string): boolean {
  const numbers = removePhoneMask(phone);
  return numbers.length === 10 || numbers.length === 11;
}
