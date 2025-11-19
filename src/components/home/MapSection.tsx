"use client";

import type { JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import type { MapStatistic, MapStatisticVariant } from "@/types/home.types";

const MapChart = dynamic(() => import("./MapChart"), { ssr: false });

const MAP_DESCRIPTION =
  "O Projeto está em seu desenvolvimento inicial, dessa maneira, o banco de dados e mapeamento está ainda com poucas informações. Ajude esse movimento a crescer, faça parte dele registrando os dados do seu abrigo/lar temporário!!";

const MAP_STATISTICS: MapStatistic[] = [
  { value: "288", label: "Abrigos", variant: "primary" },
  { value: "29", label: "Públicos" },
  { value: "185", label: "Privados" },
  { value: "16", label: "Mistos" },
  { value: "58", label: "LT/P.I" },
];

const STAT_VALUE_BASE_CLASS = "font-600 font-45 leading-none";
const STAT_LABEL_BASE_CLASS = "font-20 font-600";

const STAT_VARIANT_CLASS: Record<MapStatisticVariant, { value: string; label: string }> = {
  primary: { value: " color-primary", label: " color-primary" },
  secondary: { value: " text-color-secondary", label: " text-color-secondary" },
};

export default function MapSection(): JSX.Element {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <header className="text-center">
          <h2 className="font-600 font-34 text-brand-primary">
            Confira o Mapeamento <br /> de Abrigos pelo Brasil
          </h2>
        </header>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-light p-4 shadow-sm">
          <MapChart />
        </div>

        <div className="mt-12 rounded-2xl bg-light p-6 shadow-sm">
          <div className="text-center text-color-secondary">
            <p className="text-base md:text-lg">
              {MAP_DESCRIPTION}
            </p>
          </div>

          <div className="my-6 border-t border-slate-200" />

          <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="color-primary font-24 font-600 leading-tight">
                Nosso Banco <br /> de Dados
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-5 md:gap-8">
              {MAP_STATISTICS.map(({ value, label, variant = "secondary" }) => {
                const variantClass = STAT_VARIANT_CLASS[variant];

                return (
                  <div key={label}>
                    <h3 className={`${STAT_VALUE_BASE_CLASS}${variantClass.value}`}>
                      {value}
                    </h3>
                    <span className={`${STAT_LABEL_BASE_CLASS}${variantClass.label}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center md:justify-end">
              <Link className="btn-sample" href="/banco-de-dados">
                Acessar Banco
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
