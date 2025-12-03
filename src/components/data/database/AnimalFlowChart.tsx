"use client";

import { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import type { MonthlyAnimalFlow } from "@/types/database.types";

type AnimalFlowChartProps = {
  data: MonthlyAnimalFlow[];
  year: number;
  stateLabel: string;
};

const SERIES_COLORS = {
  entradas: "#157556",
  devolucoes: "#5e782a",
  adocoes: "#f2a400",
  eutanasias: "#0ca2d8",
  mortesNaturais: "#0d2f63",
  retornoTutor: "#9966ff",
  retornoLocal: "#9fa2a2",
};

export default function AnimalFlowChart({
  data,
  year,
  stateLabel,
}: AnimalFlowChartProps) {
  const options = useMemo<Highcharts.Options>(() => {
    const categories = data.map((item) => item.label);

    return {
      chart: { type: "column", backgroundColor: "transparent" },
      title: undefined,
      credits: { enabled: false },
      xAxis: { categories, title: { text: undefined } },
      yAxis: {
        min: 0,
        title: { text: "Animais" },
        gridLineColor: "#e2e8f0",
        reversedStacks: false,
      },
      plotOptions: {
        column: {
          stacking: "normal",
          borderRadius: 2,
          borderWidth: 0,
          pointPadding: 0.08,
          groupPadding: 0.08,
        },
      },
      legend: {
        align: "center",
        verticalAlign: "bottom",
        layout: "horizontal",
        itemStyle: { fontWeight: "500" },
      },
      tooltip: {
        shared: false,
        formatter: function () {
          return [
            `<span style="font-weight:600">${this.key}</span>`,
            `<span style="color:${this.color}">\u25A0</span> ${
              this.series.name
            }: <b>${Highcharts.numberFormat(this.y as number, 0)}</b>`,
          ].join("<br/>");
        },
      },
      series: [
        {
          type: "column",
          name: "Entradas",
          data: data.map((item) => item.entradas),
          color: SERIES_COLORS.entradas,
          stack: "stack0",
        },
        {
          type: "column",
          name: "Devoluções",
          data: data.map((item) => item.devolucoes),
          color: SERIES_COLORS.devolucoes,
          stack: "stack0",
        },
        {
          type: "column",
          name: "Adoções",
          data: data.map((item) => item.adocoes),
          color: SERIES_COLORS.adocoes,
          stack: "stack1",
        },
        {
          type: "column",
          name: "Eutanásias",
          data: data.map((item) => item.eutanasias),
          color: SERIES_COLORS.eutanasias,
          stack: "stack1",
        },
        {
          type: "column",
          name: "Mortes naturais",
          data: data.map((item) => item.mortesNaturais),
          color: SERIES_COLORS.mortesNaturais,
          stack: "stack1",
        },
        {
          type: "column",
          name: "Retorno tutor",
          data: data.map((item) => item.retornoTutor),
          color: SERIES_COLORS.retornoTutor,
          stack: "stack1",
        },
        {
          type: "column",
          name: "Retorno local origem",
          data: data.map((item) => item.retornoLocal),
          color: SERIES_COLORS.retornoLocal,
          stack: "stack1",
        },
      ],
    };
  }, [data]);

  return (
    <section
      aria-labelledby="animal-flow-title"
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-slate-100 px-5 py-3 text-center">
        <h3
          id="animal-flow-title"
          className="font-20 font-semibold text-brand-primary"
        >
          Entradas x Saídas de Animais
        </h3>
        <p className="text-xs text-slate-600">
          Movimentação mensal de {year} · {stateLabel}
        </p>
      </div>

      <div className="p-1">
        <div className="w-full overflow-x-auto">
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            containerProps={{ className: "w-full min-w-full" }}
          />
        </div>
      </div>
    </section>
  );
}
