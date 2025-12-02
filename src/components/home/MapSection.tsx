"use client";

import type { JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import type { MapStatistic } from "@/types/home.types";
import StatCard from "@/components/ui/StatCard";
import { Heading, Text } from "@/components/ui/typography";

const MapChart = dynamic(() => import("./MapChart"), { ssr: false });

const MAP_DESCRIPTION =
  "O Projeto está em seu desenvolvimento inicial, dessa maneira, o banco de dados e mapeamento está ainda com poucas informações.\nAjude esse movimento a crescer, faça parte dele registrando os dados do seu abrigo/lar temporário!!";

const MAP_STATISTICS: MapStatistic[] = [
  { value: "288", label: "Abrigos", variant: "primary" },
  { value: "29", label: "Públicos" },
  { value: "185", label: "Privados" },
  { value: "16", label: "Mistos" },
  { value: "58", label: "LT/P.I" },
];

export default function MapSection(): JSX.Element {
  return (
    <section className="bg-white">
      <div className="mx-auto px-4 py-16 md:px-6 md:py-20">
        <header className="text-center">
          <Heading as="h2" className="font-34 text-brand-primary">
            Confira o Mapeamento <br /> de Abrigos pelo Brasil
          </Heading>
        </header>

        <div className="mt-10 flex w-full justify-center">
          <div className="w-full max-w-5xl">
            <MapChart />
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-light p-6 shadow-sm">
          <div className="text-center text-color-secondary">
            <Text className="whitespace-pre-line font-16 font-normal md:text-lg">
              {MAP_DESCRIPTION}
            </Text>
          </div>

          <div className="my-6 border-t border-slate-200" />

          <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-around">
            <div className="text-center md:text-left">
              <Text className="color-primary font-24 font-600 leading-tight">
                Nosso Banco <br /> de Dados
              </Text>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-5 md:gap-8">
              {MAP_STATISTICS.map((statistic) => (
                <StatCard key={statistic.label} {...statistic} />
              ))}
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
