'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SelectDropdownOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  options: SelectDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
}

/**
 * Componente SelectDropdown - Dropdown estilizado sem busca
 * Mesmo visual do Combobox mas sem funcionalidade de busca
 *
 * @example
 * <SelectDropdown
 *   options={[{ value: 'sim', label: 'Sim' }]}
 *   value={experiencia}
 *   onChange={setExperiencia}
 *   placeholder="Selecione"
 * />
 */
export function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  disabled = false,
  className = '',
  name,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Encontra a label da opção selecionada
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label || placeholder;

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index quando abrir
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, value, options]);

  // Manipula navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && options[highlightedIndex]) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Scroll automático para opção destacada
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      const element = document.getElementById(`select-option-${highlightedIndex}`);
      element?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input para form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Campo de seleção */}
      <div
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          flex items-center justify-between gap-2 w-full px-4 py-3 rounded-lg border text-base
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-slate-500' : 'bg-white cursor-pointer text-[#4f5464]'}
          ${isOpen ? 'ring-2 ring-brand-primary/20 border-brand-primary' : 'border-slate-200'}
          transition outline-none
        `}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedOption ? 'text-[#4f5464]' : 'text-[#a0a6b1]'}>
          {displayValue}
        </span>

        <svg
          className={`w-4 h-4 text-[#4f5464] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown de opções */}
      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`select-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`
                px-4 py-3 cursor-pointer transition-colors text-base text-[#4f5464]
                ${index === highlightedIndex ? 'bg-brand-primary/10' : ''}
                ${option.value === value ? 'bg-brand-primary/5 font-medium' : ''}
                hover:bg-brand-primary/10
              `}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
