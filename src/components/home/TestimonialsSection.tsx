"use client";

import type { JSX, PointerEvent } from "react";
import { useRef, useState } from "react";
import clsx from "clsx";

import SliderDots from "@/components/ui/SliderDots";
import { Heading, Text } from "@/components/ui/typography";
import AppImage from "@/components/ui/AppImage";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "O Brasil possui uma das maiores populações de cães e gatos do mundo. Entretanto, os dados a respeito de quantos destes animais estão alojados em lares temporários, abrigos, ou nas ruas do País são escassos. A criação de um banco de dados nacional, que reflita a dinâmica populacional dos cães e gatos, impactará diretamente tanto na implementação de melhores estratégias de manejo, quanto na promoção de políticas públicas. Ademais, a Medicina de Abrigos precisa ser mais bem difundida no Brasil, de modo que mais profissionais se capacitem e trabalhem em prol de dos animais e da Saúde Única.",
    name: "Diana Cuglovici Abrão",
    role: "Médica Veterinária, Professora do IFSULDEMINAS",
    avatar: "/assets/img/depoimento1.png",
  },
  {
    quote:
      "Esta plataforma, pioneira no Brasil, se faz essencial em nosso país, reunindo informações científicas valiosas que apoiarão pesquisadores e profissionais que trabalham com a medicina de abrigos e que nunca tiveram acesso a um conteúdo de tamanha qualidade,  reunidos em um só local! Parabéns aos organizadores e que esta plataforma continue como referencia aos profissionais que  impactam a vida de milhares de animais",
    name: "Rosangela Ribeiro Gebara",
    role: "Membro da Diretoria do Instituto de Medicina Veterinária do Coletivo",
    avatar: "/assets/img/depoimento2.png",
  },
];

const DRAG_THRESHOLD = 50;

export default function TestimonialsSection(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const hasSwiped = useRef(false);
  const slidesCount = TESTIMONIALS.length;

  const goToIndex = (nextIndex: number) => {
    const normalizedIndex = (nextIndex + slidesCount) % slidesCount;
    setActiveIndex(normalizedIndex);
  };

  const handleNext = () => goToIndex(activeIndex + 1);
  const handlePrev = () => goToIndex(activeIndex - 1);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
    hasSwiped.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null || hasSwiped.current) return;

    const deltaX = event.clientX - dragStartX.current;
    if (Math.abs(deltaX) > DRAG_THRESHOLD) {
      hasSwiped.current = true;
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const handlePointerUp = () => {
    dragStartX.current = null;
    hasSwiped.current = false;
    setIsDragging(false);
  };

  const cardClassName = clsx(
    "mt-10 w-full max-w-4xl rounded-3xl px-4 py-8 md:px-6 md:py-10 select-none transition-colors duration-200",
    isDragging ? "cursor-grabbing" : "cursor-grab"
  );
  const trackStyle = { transform: `translateX(-${activeIndex * 100}%)` };

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.55)_100%)] min-h-[80vh]">
      <AppImage
        src="/assets/img/bg_intro.jpg"
        alt="Plano de fundo de animais"
        fill
        quality={85}
        className="-z-10 object-cover"
        style={{ contentVisibility: "auto" }}
      />

      <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center px-6 py-16 text-center text-white md:px-8 md:py-24">
        <Text className="font-20 font-600 uppercase tracking-[0.04em] text-brand-accent">
          Depoimentos
        </Text>
        <Heading as="h2" className="max-w-md mt-2 font-600 font-34 md:font-36">
          Confira o que estão falando da gente
        </Heading>

        <div
          className={cardClassName}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="group"
          aria-roledescription="Carrossel de depoimentos"
          aria-label="Carrossel de depoimentos"
        >
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex w-full transition-transform duration-500 ease-out"
              style={trackStyle}
              aria-live="polite"
            >
              {TESTIMONIALS.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className="flex w-full shrink-0 flex-col items-center gap-6 px-2 py-2 text-white md:gap-8"
                  aria-hidden={index !== activeIndex}
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full shadow-lg md:h-28 md:w-28">
                    <AppImage
                      src={testimonial.avatar}
                      alt={`Retrato de ${testimonial.name}`}
                      width={128}
                      height={128}
                      quality={100}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 768px) 96px, 112px"
                    />
                  </div>

                  <p className="text-sm leading-relaxed text-white">
                    &quot;{testimonial.quote}&quot;
                  </p>

                  <div className="text-center">
                    <p className="font-600 text-lg md:text-xl">
                      {testimonial.name}
                    </p>
                    <p className="font-600 text-brand-accent">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <SliderDots
              total={TESTIMONIALS.length}
              activeIndex={activeIndex}
              onSelect={goToIndex}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
