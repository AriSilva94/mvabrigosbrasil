"use client";

import type { JSX } from "react";
import { useState } from "react";

import SliderDots from "@/components/ui/SliderDots";
import SliderNavButton from "@/components/ui/SliderNavButton";
import { Heading, Text } from "@/components/ui/typography";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  NATIONAL_BENEFITS,
  NATIONAL_HEADING,
  SHELTER_BENEFITS,
  SHELTER_HEADING,
} from "@/constants/benefits";

const SLIDER_ICONS = {
  previous: ChevronLeft,
  next: ChevronRight,
} as const;

export default function BenefitsSection(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () =>
    setActiveIndex((prevIndex) => (prevIndex + 1) % SHELTER_BENEFITS.length);
  const handlePrev = () =>
    setActiveIndex(
      (prevIndex) =>
        (prevIndex - 1 + SHELTER_BENEFITS.length) % SHELTER_BENEFITS.length
    );

  return (
    <section className="bg-white py-16 overflow-x-hidden md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 px-4 md:px-6">
        <div className="text-center space-y-3">
          <Text className="font-20 font-600 text-brand-accent">
            Nossos Benefícios
          </Text>
          <Heading
            as="h2"
            className="font-600 font-34 text-brand-primary break-words text-balance"
          >
            {NATIONAL_HEADING}
          </Heading>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {NATIONAL_BENEFITS.map(({ title, description }) => (
            <article
              key={title}
              className="flex h-full flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Heading as="h3" className="font-600 font-20 text-brand-primary">
                {title}
              </Heading>
              <Text className="font-16 text-color-secondary">
                {description}
              </Text>
            </article>
          ))}
        </div>

        <div className="text-center space-y-3">
          <Heading
            as="h2"
            className="font-600 font-34 text-brand-primary wrap-break-words text-balance"
          >
            {SHELTER_HEADING}
          </Heading>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-light py-8 shadow-sm w-full overflow-x-hidden">
          <div className="relative w-full max-w-full sm:max-w-[640px]">
            <div className="relative overflow-hidden rounded-xl text-center sm:flex-1 sm:min-w-0">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {SHELTER_BENEFITS.map(({ title, description, icon }, index) => (
                  <div
                    key={title}
                    className="w-full shrink-0 flex flex-col items-center gap-2 px-6"
                  >
                    <div className="flex justify-center">{icon}</div>
                    <p className="mt-2 font-600 font-20 text-brand-primary text-balance text-center">
                      {index + 1}. {title}
                    </p>
                    <p className="font-16 text-color-secondary text-balance text-center">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1 sm:px-3">
                <SliderNavButton
                  className="pointer-events-auto shrink-0 bg-light shadow-sm"
                  onClick={handlePrev}
                  label="Previous benefit"
                >
                  <SLIDER_ICONS.previous className="h-5 w-5" />
                </SliderNavButton>
                <SliderNavButton
                  className="pointer-events-auto shrink-0 bg-light shadow-sm"
                  onClick={handleNext}
                  label="Next benefit"
                >
                  <SLIDER_ICONS.next className="h-5 w-5" />
                </SliderNavButton>
              </div>
            </div>
          </div>

          <SliderDots
            total={SHELTER_BENEFITS.length}
            activeIndex={activeIndex}
          />
        </div>
      </div>
    </section>
  );
}
