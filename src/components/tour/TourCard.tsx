"use client";

import type { CardComponentProps } from "nextstepjs";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
}: CardComponentProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="relative w-[320px] rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_20px_60px_rgba(16,130,89,0.15)]">
      {/* Decorative paw prints */}
      <div className="pointer-events-none absolute -top-3 -right-3 text-2xl opacity-20 rotate-12">
        🐾
      </div>

      {/* Close button */}
      <button
        onClick={skipTour}
        className="absolute top-3 right-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label="Fechar tour"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header with icon and title */}
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#108259]/10 text-xl">
          {step.icon}
        </span>
        <h3 className="pr-6 text-lg font-bold text-[#4f5464]">{step.title}</h3>
      </div>

      {/* Content */}
      <p className="mb-5 text-sm leading-relaxed text-[#7b8191]">
        {step.content}
      </p>

      {/* Footer with progress and navigation */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? "w-4 bg-[#108259]"
                  : index < currentStep
                    ? "w-1.5 bg-[#108259]/40"
                    : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              onClick={prevStep}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              aria-label="Passo anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={nextStep}
            className="flex h-8 items-center gap-1 rounded-full bg-[#108259] px-4 text-sm font-medium text-white transition hover:bg-[#108259]/90"
          >
            {isLastStep ? (
              "Concluir"
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
