"use client";

import { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

type SpeciesEntriesChartProps = {
  data: Array<{ label: string; dogs: number; cats: number; total: number }>;
};

export default function SpeciesEntriesChart({
  data,
}: SpeciesEntriesChartProps) {
  const options = useMemo<Highcharts.Options>(() => {
    return {
      chart: { type: "spline", backgroundColor: "transparent" },
      title: undefined,
      credits: { enabled: false },
      xAxis: { categories: data.map((item) => item.label) },
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
          marker: { radius: 4, symbol: "circle", lineWidth: 2 },
        },
      },
      series: [
        {
          type: "spline",
          name: "Cães",
          data: data.map((item) => item.dogs),
          color: "#ffa3a3",
        },
        {
          type: "spline",
          name: "Gatos",
          data: data.map((item) => item.cats),
          color: "#b51111",
        },
        {
          type: "spline",
          name: "Todos",
          data: data.map((item) => item.total),
          color: "#3c3c3c",
        },
      ],
    };
  }, [data]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-center">
        <h3 className="font-20 font-semibold text-brand-red">
          Saídas de Animais
        </h3>
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
