"use client";

import { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

type OutcomesStackedChartProps = {
  title: string;
  data: Array<{
    label: string;
    adocoes: number;
    mortesNaturais: number;
    eutanasias: number;
    retornoTutor: number;
    retornoLocal: number;
  }>;
};

export default function OutcomesStackedChart({ title, data }: OutcomesStackedChartProps) {
  const options = useMemo<Highcharts.Options>(() => {
    return {
      chart: { type: "column", backgroundColor: "transparent" },
      title: undefined,
      credits: { enabled: false },
      xAxis: { categories: data.map((item) => item.label) },
      yAxis: {
        min: 0,
        title: { text: undefined },
        gridLineColor: "#e2e8f0",
        stackLabels: { enabled: false },
        reversedStacks: false,
      },
      legend: { align: "center", verticalAlign: "bottom" },
      tooltip: {
        shared: false,
        formatter: function () {
          return [
            `<span style="font-weight:600">${this.key}</span>`,
            `<span style="color:${this.color}">\u25A0</span> ${this.series.name}: <b>${Highcharts.numberFormat(
              this.y as number,
              0
            )}</b>`,
          ].join("<br/>");
        },
      },
      plotOptions: {
        column: {
          stacking: "normal",
          borderWidth: 0,
          borderRadius: 2,
          pointPadding: 0.08,
          groupPadding: 0.12,
        },
      },
      series: [
        {
          type: "column",
          name: "Adoção",
          data: data.map((item) => item.adocoes),
          color: "#f2a400",
        },
        {
          type: "column",
          name: "Morte Natural",
          data: data.map((item) => item.mortesNaturais),
          color: "#0d2f63",
        },
        {
          type: "column",
          name: "Eutanásia",
          data: data.map((item) => item.eutanasias),
          color: "#1286b8",
        },
        {
          type: "column",
          name: "Retorno Tutor",
          data: data.map((item) => item.retornoTutor),
          color: "#9966ff",
        },
        {
          type: "column",
          name: "Retorno Local Origem",
          data: data.map((item) => item.retornoLocal),
          color: "#c9cfcf",
        },
      ],
    };
  }, [data]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
        <h3 className="font-20 font-semibold text-brand-primary">{title}</h3>
      </div>
      <div className="p-4">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </section>
  );
}
