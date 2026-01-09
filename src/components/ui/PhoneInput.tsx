'use client';

import React, { forwardRef } from 'react';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Componente PhoneInput - Input com máscara de telefone (DDD)
 * Formatos aceitos: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * Remove caracteres especiais automaticamente ao processar
 *
 * @example
 * <PhoneInput
 *   value={telefone}
 *   onChange={setTelefone}
 *   placeholder="(00) 00000-0000"
 * />
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className = '', ...props }, ref) => {
    /**
     * Aplica máscara de telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
     */
    const applyPhoneMask = (rawValue: string): string => {
      // Remove tudo que não é número
      const numbers = rawValue.replace(/\D/g, '');

      // Limita a 11 dígitos (DDD + número)
      const limitedNumbers = numbers.slice(0, 11);

      // Aplica a máscara
      if (limitedNumbers.length === 0) {
        return '';
      } else if (limitedNumbers.length <= 2) {
        return `(${limitedNumbers}`;
      } else if (limitedNumbers.length <= 6) {
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
      } else if (limitedNumbers.length <= 10) {
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
      } else {
        // 11 dígitos (celular com 9 no início)
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`;
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
  }
);

PhoneInput.displayName = 'PhoneInput';

/**
 * Remove formatação de telefone (mantém apenas números)
 * Útil para validação e envio de dados
 *
 * @example
 * removePhoneMask('(11) 98765-4321') // '11987654321'
 */
export function removePhoneMask(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Valida se o telefone tem 10 ou 11 dígitos
 *
 * @example
 * isValidPhone('(11) 98765-4321') // true
 * isValidPhone('(11) 8765-4321') // true
 * isValidPhone('(11) 765-4321') // false
 */
export function isValidPhone(phone: string): boolean {
  const numbers = removePhoneMask(phone);
  return numbers.length === 10 || numbers.length === 11;
}
