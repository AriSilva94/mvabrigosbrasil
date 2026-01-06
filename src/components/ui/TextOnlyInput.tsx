'use client';

import React, { forwardRef } from 'react';

interface TextOnlyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

/**
 * Componente TextOnlyInput - Input que não permite apenas números
 * Bloqueia a digitação quando o campo contém somente números
 *
 * @example
 * <TextOnlyInput
 *   name="profissao"
 *   placeholder="Ex: Veterinário"
 * />
 */
export const TextOnlyInput = forwardRef<HTMLInputElement, TextOnlyInputProps>(
  ({ className = '', onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const currentValue = input.value;
      const key = e.key;

      // Permite teclas de controle
      const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (controlKeys.includes(key) || e.ctrlKey || e.metaKey) {
        onKeyDown?.(e);
        return;
      }

      // Se a tecla for um número
      if (/^\d$/.test(key)) {
        // Pega o valor que seria após a digitação
        const newValue = currentValue + key;

        // Se o novo valor for somente números, bloqueia
        if (/^\d+$/.test(newValue.trim())) {
          e.preventDefault();
          return;
        }
      }

      onKeyDown?.(e);
    };

    return (
      <input
        ref={ref}
        type="text"
        onKeyDown={handleKeyDown}
        className={`
          px-4 py-2 rounded-lg border border-gray-300 w-full
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
    );
  }
);

TextOnlyInput.displayName = 'TextOnlyInput';
