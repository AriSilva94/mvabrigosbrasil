'use client';

import React, { forwardRef, useId, useMemo, useEffect, useRef } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import { size } from '@floating-ui/react';
import { PawPrint } from 'lucide-react';
import { Combobox } from './Combobox';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker.css';

registerLocale('pt-BR', ptBR);

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, monthIndex) =>
  ptBR.localize?.month(monthIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11, { width: 'wide' }) ?? ''
);

const MONTH_COMBO_OPTIONS = MONTH_OPTIONS.map((label, value) => ({
  value: String(value),
  label,
}));

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  minDate?: string;
  maxDate?: string;
}

/**
 * Componente DatePicker - Input de data com calendário customizado
 * Usa react-datepicker com locale pt-BR
 *
 * @example
 * <DatePicker
 *   value={fundacao}
 *   onChange={setFundacao}
 *   maxDate={new Date().toISOString().split('T')[0]}
 * />
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ value, onChange, className = '', minDate, maxDate, disabled, id, name, required }, _ref) => {
    // Converte string ISO para Date object (considera fuso local)
    const selectedDate = value ? new Date(value + 'T00:00:00') : null;

    // Converte minDate e maxDate strings para Date objects (considera fuso local)
    const minDateObj = useMemo(
      () => (minDate ? new Date(minDate + 'T00:00:00') : undefined),
      [minDate]
    );
    const maxDateObj = useMemo(
      () => (maxDate ? new Date(maxDate + 'T00:00:00') : undefined),
      [maxDate]
    );

    const monthLabelId = useId();
    const yearLabelId = useId();
    const popperWidthModifiers = useMemo(
      () => [
        size({
          apply: ({ rects, availableWidth, elements }) => {
            const referenceWidth = rects.reference.width;
            const maxWidth = Number.isFinite(availableWidth) ? availableWidth : referenceWidth;
            const targetWidth = Math.max(0, Math.min(referenceWidth, maxWidth));
            elements.floating.style.width = `${targetWidth}px`;
          },
        }),
      ],
      []
    );

    const yearOptions = useMemo(() => {
      const currentYear = new Date().getFullYear();
      const minYear = minDateObj?.getFullYear() ?? 1980;
      const maxYear = maxDateObj?.getFullYear() ?? currentYear;
      const startYear = Math.min(minYear, maxYear);
      const endYear = Math.max(minYear, maxYear);

      return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);
    }, [maxDateObj, minDateObj]);

    const yearComboOptions = useMemo(
      () => yearOptions.map((year) => ({ value: String(year), label: String(year) })),
      [yearOptions]
    );

    const handleChange = (date: Date | null) => {
      if (date) {
        // Converte Date para string ISO no fuso local (YYYY-MM-DD)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${day}`;
        onChange?.(isoDate);
      } else {
        onChange?.('');
      }
    };

    // Ref para armazenar funções de navegação do datepicker
    const navigationRef = useRef<{
      increaseMonth?: () => void;
      decreaseMonth?: () => void;
    }>({});

    // Hook para adicionar swipe gesture no calendário
    useEffect(() => {
      let touchStartX = 0;
      let touchStartY = 0;
      let isDragging = false;

      const handleTouchStart = (e: TouchEvent | MouseEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        touchStartX = clientX;
        touchStartY = clientY;
        isDragging = true;
      };

      const handleTouchMove = (e: TouchEvent | MouseEvent) => {
        if (!isDragging) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - touchStartX;
        const deltaY = clientY - touchStartY;

        // Só considera swipe horizontal se o movimento horizontal for maior que o vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
          e.preventDefault();
        }
      };

      const handleTouchEnd = (e: TouchEvent | MouseEvent) => {
        if (!isDragging) return;

        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
        const deltaX = clientX - touchStartX;

        // Threshold mínimo de 50px para considerar como swipe
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            // Swipe para direita = mês anterior
            navigationRef.current.decreaseMonth?.();
          } else if (deltaX < 0) {
            // Swipe para esquerda = próximo mês
            navigationRef.current.increaseMonth?.();
          }
        }

        isDragging = false;
      };

      // Adiciona listeners após o calendário ser montado
      const addListeners = () => {
        const monthElement = document.querySelector('.react-datepicker__month');
        if (monthElement) {
          // Touch events
          monthElement.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
          monthElement.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
          monthElement.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });

          // Mouse events
          monthElement.addEventListener('mousedown', handleTouchStart as EventListener);
          monthElement.addEventListener('mousemove', handleTouchMove as EventListener);
          monthElement.addEventListener('mouseup', handleTouchEnd as EventListener);
          monthElement.addEventListener('mouseleave', handleTouchEnd as EventListener);
        }
      };

      // Observa quando o calendário é montado
      const observer = new MutationObserver(() => {
        if (document.querySelector('.react-datepicker__month')) {
          addListeners();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        const monthElement = document.querySelector('.react-datepicker__month');
        if (monthElement) {
          monthElement.removeEventListener('touchstart', handleTouchStart as EventListener);
          monthElement.removeEventListener('touchmove', handleTouchMove as EventListener);
          monthElement.removeEventListener('touchend', handleTouchEnd as EventListener);
          monthElement.removeEventListener('mousedown', handleTouchStart as EventListener);
          monthElement.removeEventListener('mousemove', handleTouchMove as EventListener);
          monthElement.removeEventListener('mouseup', handleTouchEnd as EventListener);
          monthElement.removeEventListener('mouseleave', handleTouchEnd as EventListener);
        }
      };
    }, []);

    return (
      <ReactDatePicker
        id={id}
        name={name}
        selected={selectedDate}
        onChange={handleChange}
        locale="pt-BR"
        dateFormat="dd/MM/yyyy"
        minDate={minDateObj}
        maxDate={maxDateObj}
        disabled={disabled}
        required={required}
        placeholderText="dd/mm/aaaa"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        strictParsing
        showMonthYearPicker={false}
        showFullMonthYearPicker={false}
        popperClassName="react-datepicker-popper--match-input"
        popperModifiers={popperWidthModifiers}
        renderCustomHeader={(customHeaderProps) => {
          const {
            date,
            changeYear,
            changeMonth,
            increaseMonth,
            decreaseMonth,
          } = customHeaderProps;

          // Armazena as funções de navegação para uso no swipe
          navigationRef.current = { increaseMonth, decreaseMonth };

          return (
            <div className="flex items-center justify-center gap-2 px-1">
              <div className="react-datepicker__header__dropdown">
                <div className="react-datepicker__month-dropdown-container flex flex-col gap-1">
                  <span
                    id={monthLabelId}
                    className="react-datepicker__dropdown-label"
                  >
                    Mês
                  </span>
                  <Combobox
                    options={MONTH_COMBO_OPTIONS}
                    value={String(date.getMonth())}
                    onChange={(newMonth) => changeMonth(Number(newMonth))}
                    placeholder="Mês"
                    className="w-24 sm:w-28"
                    size="xs"
                    responsiveSize={true}
                    fullWidth={false}
                    maxHeight="max-h-48"
                    ariaLabel="Mês"
                    ariaLabelledby={monthLabelId}
                  />
                </div>

                <div className="react-datepicker__header__icon pb-0.5">
                  <PawPrint className="h-5 w-5 text-brand-primary shrink-0" aria-hidden />
                </div>

                <div className="react-datepicker__year-dropdown-container flex flex-col gap-1">
                  <span
                    id={yearLabelId}
                    className="react-datepicker__dropdown-label"
                  >
                    Ano
                  </span>
                  <Combobox
                    options={yearComboOptions}
                    value={String(date.getFullYear())}
                    onChange={(newYear) => changeYear(Number(newYear))}
                    placeholder="Ano"
                    className="w-24 sm:w-28"
                    size="xs"
                    responsiveSize={true}
                    fullWidth={false}
                    maxHeight="max-h-48"
                    ariaLabel="Ano"
                    ariaLabelledby={yearLabelId}
                  />
                </div>
              </div>
            </div>
          );
        }}
        className={`
          px-4 py-3 rounded-lg border border-slate-200 w-full text-base text-[#4f5464]
          bg-white placeholder:text-[#a0a6b1]
          focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-slate-500
          transition
          ${className}
        `}
        wrapperClassName="w-full"
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';
