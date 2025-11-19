"use client";

import type { JSX } from "react";
import { useState } from "react";

import SliderDots from "@/components/ui/SliderDots";
import SliderNavButton from "@/components/ui/SliderNavButton";
import { Heading, Text } from "@/components/ui/typography";
import {
  NATIONAL_BENEFITS,
  NATIONAL_HEADING,
  SHELTER_BENEFITS,
  SHELTER_HEADING,
} from "@/constants/benefits";

const SLIDER_ICONS = {
  previous: "‹",
  next: "›",
} as const;

export default function BenefitsSection(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);

  const current = SHELTER_BENEFITS[activeIndex];

  const handleNext = () =>
    setActiveIndex((prevIndex) => (prevIndex + 1) % SHELTER_BENEFITS.length);
  const handlePrev = () =>
    setActiveIndex(
      (prevIndex) =>
        (prevIndex - 1 + SHELTER_BENEFITS.length) % SHELTER_BENEFITS.length
    );

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 md:px-6">
        <div className="text-center space-y-3">
          <Text className="font-20 font-600 text-brand-accent">
            Nossos Benefícios
          </Text>
          <Heading as="h2" className="font-600 font-34 text-brand-primary">
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
              <Text className="font-16 text-color-secondary">{description}</Text>
            </article>
          ))}
        </div>

        <div className="text-center space-y-3">
          <Heading as="h2" className="font-600 font-34 text-brand-primary">
            {SHELTER_HEADING}
          </Heading>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-light p-8 shadow-sm">
          <div className="flex w-full items-center justify-between">
            <SliderNavButton onClick={handlePrev} label="Previous benefit">
              {SLIDER_ICONS.previous}
            </SliderNavButton>
            <div className="text-center">
              <div className="flex justify-center">{current.icon}</div>
              <p className="mt-2 font-600 font-20 text-brand-primary">
                {activeIndex + 1}. {current.title}
              </p>
              <p className="font-16 text-color-secondary">
                {current.description}
              </p>
            </div>
            <SliderNavButton onClick={handleNext} label="Next benefit">
              ›
            </SliderNavButton>
          </div>

          <SliderDots total={SHELTER_BENEFITS.length} activeIndex={activeIndex} />
        </div>
      </div>
    </section>
  );
}
