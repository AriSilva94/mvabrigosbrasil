"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import type { MapStatisticItem } from "@/types/map.types";
import type { MapStatistics } from "@/app/api/map-statistics/route";
import StatCard from "@/components/ui/StatCard";
import { Heading, Text } from "@/components/ui/typography";
import { convertStateDataToMapPoints } from "@/lib/utils/stateMapping";
import type { MapPoint } from "./MapChart";

const MapChart = dynamic(() => import("./MapChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full" style={{ minHeight: "500px" }}>
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
          <p className="mt-4 text-sm text-slate-600">Carregando mapa...</p>
        </div>
      </div>
    </div>
  ),
});

const MAP_DESCRIPTION =
  "O Projeto está em seu desenvolvimento inicial, dessa maneira, o banco de dados e mapeamento está ainda com poucas informações.\nAjude esse movimento a crescer, faça parte dele registrando os dados do seu abrigo/lar temporário!!";

export default function MapSection(): JSX.Element {
  const [mapData, setMapData] = useState<MapPoint[]>([]);
  const [statistics, setStatistics] = useState<MapStatisticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMapStatistics() {
      try {
        const response = await fetch("/api/map-statistics");
        if (!response.ok) {
          throw new Error("Failed to fetch map statistics");
        }

        const data: MapStatistics = await response.json();

        // Converter dados para o formato do mapa
        const mapPoints = convertStateDataToMapPoints(data.byState);
        setMapData(mapPoints);

        // Criar estatísticas para exibição
        const stats: MapStatisticItem[] = [
          {
            value: data.byType.total.toString(),
            label: "Abrigos",
            variant: "primary"
          },
          {
            value: data.byType.public.toString(),
            label: "Públicos"
          },
          {
            value: data.byType.private.toString(),
            label: "Privados"
          },
          {
            value: data.byType.mixed.toString(),
            label: "Mistos"
          },
          {
            value: data.byType.temporary.toString(),
            label: "LT/P.I"
          },
        ];
        setStatistics(stats);
      } catch (error) {
        console.error("Error fetching map statistics:", error);
        // Em caso de erro, manter arrays vazios
      } finally {
        setIsLoading(false);
      }
    }

    fetchMapStatistics();
  }, []);

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
            <MapChart data={mapData} isLoading={isLoading} />
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
              {statistics.map((statistic) => (
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
