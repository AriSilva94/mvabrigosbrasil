"use client";

import type { CardComponentProps } from "nextstepjs";
import { motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export function HomeTourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
}: CardComponentProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isWelcomeStep = isFirstStep;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="relative w-[340px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_25px_70px_rgba(16,130,89,0.2)]"
    >
      {/* Gradient header for welcome step */}
      {isWelcomeStep && (
        <div className="relative bg-gradient-to-r from-[#108259] to-[#0d6b4a] px-5 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Sparkles className="h-6 w-6 text-[#fbbf24]" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="text-sm text-white/80">Nova plataforma</p>
            </div>
          </motion.div>

          {/* Animated paw prints decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.4 }}
            className="absolute -right-1 -bottom-1 text-4xl"
          >
            🐾
          </motion.div>
        </div>
      )}

      {/* Regular header for other steps */}
      {!isWelcomeStep && (
        <div className="px-5 pt-5">
          <div className="flex items-center gap-3">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#108259]/10 text-xl"
            >
              {step.icon}
            </motion.span>
            <h3 className="pr-6 text-lg font-bold text-[#4f5464]">
              {step.title}
            </h3>
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={skipTour}
        className={`absolute top-3 right-3 rounded-full p-1 transition ${
          isWelcomeStep
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        }`}
        aria-label="Fechar tour"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="px-5 py-4"
      >
        <p className="text-sm leading-relaxed text-[#7b8191]">{step.content}</p>
      </motion.div>

      {/* Footer with progress and navigation */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? "w-5 bg-[#108259]"
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
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={prevStep}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              aria-label="Passo anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextStep}
            className="flex h-8 items-center gap-1 rounded-full bg-[#108259] px-4 text-sm font-medium text-white transition hover:bg-[#0d6b4a]"
          >
            {isLastStep ? (
              "Explorar"
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
