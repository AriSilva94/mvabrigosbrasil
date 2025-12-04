"use client";

import { useMemo, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { useChartReflow } from "./hooks/useChartReflow";

type SpeciesSeries = {
  label: string;
  dogs: number;
  cats: number;
  total: number;
};

type MonthlyEntriesChartProps = {
  data: SpeciesSeries[];
};

export default function MonthlyEntriesChart({
  data,
}: MonthlyEntriesChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo<Highcharts.Options>(() => {
    return {
      chart: { type: "spline", backgroundColor: "transparent" },
      title: undefined,
      credits: { enabled: false },
      xAxis: {
        categories: data.map((item) => item.label),
        lineColor: "#e2e8f0",
      },
      yAxis: {
        min: 0,
        title: { text: undefined },
        gridLineColor: "#e2e8f0",
      },
      legend: { align: "center", verticalAlign: "bottom" },
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
      plotOptions: {
        spline: {
          lineWidth: 3,
          marker: {
            radius: 4,
            symbol: "circle",
            lineWidth: 2,
          },
        },
      },
      series: [
        {
          type: "spline",
          name: "Cães",
          data: data.map((item) => item.dogs),
          color: "#f2a400",
        },
        {
          type: "spline",
          name: "Gatos",
          data: data.map((item) => item.cats),
          color: "#157556",
        },
        {
          type: "spline",
          name: "Todos",
          data: data.map((item) => item.total),
          color: "#5397d7",
        },
      ],
    };
  }, [data]);

  useChartReflow(chartRef, containerRef, [data]);

  return (
    <section
      aria-labelledby="entries-title"
      className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-slate-100 px-5 py-3 text-center">
        <h3
          id="entries-title"
          className="font-20 font-semibold text-brand-primary"
        >
          Entradas de Animais
        </h3>
      </div>
      <div className="p-1">
        <div ref={containerRef} className="w-full min-w-0 overflow-x-auto">
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={chartRef}
          />
        </div>
      </div>
    </section>
  );
}
