'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  size?: 'md' | 'sm' | 'xs';
  responsiveSize?: boolean; // Se true, usa xs em mobile e sm em desktop
  fullWidth?: boolean;
  maxHeight?: string; // Altura máxima do dropdown (ex: 'max-h-40', 'max-h-60')
}

/**
 * Componente Combobox - Select com busca
 *
 * @example
 * <Combobox
 *   options={[{ value: 'SP', label: 'São Paulo' }]}
 *   value={estado}
 *   onChange={setEstado}
 *   placeholder="Selecione um estado"
 * />
 */
/**
 * Remove acentos de uma string para facilitar busca
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  disabled = false,
  loading = false,
  className = '',
  name,
  ariaLabel,
  ariaLabelledby,
  size = 'md',
  responsiveSize = false,
  fullWidth = true,
  maxHeight = 'max-h-60',
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtra opções baseado na busca (sem acentos)
  const filteredOptions = options.filter((option) => {
    const searchNormalized = removeAccents(searchTerm.toLowerCase());
    const labelNormalized = removeAccents(option.label.toLowerCase());
    return labelNormalized.includes(searchNormalized);
  });

  // Encontra a label da opção selecionada
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label || '';

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manipula navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  // Scroll automático para opção destacada
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      const element = document.getElementById(`option-${highlightedIndex}`);
      element?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Scroll para opção selecionada quando abre
  useEffect(() => {
    if (isOpen && value && dropdownRef.current) {
      // Encontra o índice da opção selecionada nas opções filtradas
      const selectedIndex = filteredOptions.findIndex(opt => opt.value === value);
      if (selectedIndex >= 0) {
        // Pequeno delay para garantir que o DOM foi renderizado
        setTimeout(() => {
          const element = document.getElementById(`option-${selectedIndex}`);
          if (element && dropdownRef.current) {
            // Calcula a posição para centralizar o item no dropdown
            const dropdownHeight = dropdownRef.current.clientHeight;
            const elementHeight = element.clientHeight;
            const elementTop = element.offsetTop;
            const scrollTop = elementTop - (dropdownHeight / 2) + (elementHeight / 2);

            dropdownRef.current.scrollTop = scrollTop;
          }
        }, 0);
      }
    }
  }, [isOpen, value, filteredOptions]);

  const actualSize = size;

  const sizeStyles =
    actualSize === 'xs'
      ? {
          shell: responsiveSize ? 'px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm' : 'px-2 py-1.5 text-xs',
          input: responsiveSize ? 'text-xs placeholder:text-xs sm:text-sm sm:placeholder:text-sm' : 'text-xs placeholder:text-xs',
          icon: responsiveSize ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3 h-3',
          option: responsiveSize ? 'px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm' : 'px-2 py-1.5 text-xs',
          empty: responsiveSize ? 'px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm' : 'px-2 py-1.5 text-xs',
          searchPlaceholder: 'Buscar...',
        }
      : actualSize === 'sm'
      ? {
          shell: 'px-3 py-2 text-sm',
          input: 'text-sm',
          icon: 'w-3.5 h-3.5',
          option: 'px-3 py-2 text-sm',
          empty: 'px-3 py-2 text-sm',
          searchPlaceholder: 'Digite para buscar...',
        }
      : {
          shell: 'px-4 py-3 text-base',
          input: 'text-base',
          icon: 'w-4 h-4',
          option: 'px-4 py-3 text-base',
          empty: 'px-4 py-3 text-base',
          searchPlaceholder: 'Digite para buscar...',
        };

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? 'block w-full' : 'inline-block'} ${className}`}
    >
      {/* Hidden input para form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Campo de busca/seleção */}
      <div
        className={`
          flex items-center justify-between gap-2 ${fullWidth ? 'w-full' : 'w-auto'} rounded-lg border ${sizeStyles.shell}
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-slate-500' : 'bg-white cursor-pointer text-[#4f5464]'}
          ${isOpen ? 'ring-2 ring-brand-primary/20 border-brand-primary' : 'border-slate-200'}
          transition outline-none
        `}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className={`flex-1 outline-none bg-transparent text-[#4f5464] placeholder:text-[#a0a6b1] ${sizeStyles.input}`}
          placeholder={isOpen ? sizeStyles.searchPlaceholder : placeholder}
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          readOnly={!isOpen}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
        />

        {loading ? (
          <div className="animate-spin h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full" />
        ) : (
          <svg
            className={`${sizeStyles.icon} text-[#4f5464] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Dropdown de opções */}
      {isOpen && !disabled && (
        <div ref={dropdownRef} className={`absolute z-100 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg ${maxHeight} overflow-auto`}>
          {filteredOptions.length === 0 ? (
            <div className={`${sizeStyles.empty} text-[#a0a6b1] text-center`}>
              Nenhum resultado encontrado
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                id={`option-${index}`}
                className={`
                  ${sizeStyles.option} cursor-pointer transition-colors text-[#4f5464]
                  ${index === highlightedIndex ? 'bg-brand-primary/10' : ''}
                  ${option.value === value ? 'bg-brand-primary/5 font-medium' : ''}
                  hover:bg-brand-primary/10
                `}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
