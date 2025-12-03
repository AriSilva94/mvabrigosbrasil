"use client";

import { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

type TypeEntriesChartProps = {
  title: string;
  data: Array<{
    label: string;
    publico: number;
    privado: number;
    misto: number;
    ltpi: number;
  }>;
};

export default function TypeEntriesChart({
  title,
  data,
}: TypeEntriesChartProps) {
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
        column: {
          pointPadding: 0.1,
          groupPadding: 0.12,
          borderWidth: 0,
          borderRadius: 2,
        },
      },
      series: [
        {
          type: "column",
          name: "Público",
          data: data.map((item) => item.publico),
          color: "#63abfd",
        },
        {
          type: "column",
          name: "Privado",
          data: data.map((item) => item.privado),
          color: "#f2a400",
        },
        {
          type: "column",
          name: "Misto",
          data: data.map((item) => item.misto),
          color: "#147656",
        },
        {
          type: "column",
          name: "LT/P.I",
          data: data.map((item) => item.ltpi),
          color: "#d77353",
        },
      ],
    };
  }, [data]);

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-center">
        <h3 className="font-20 font-semibold text-brand-primary">{title}</h3>
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
