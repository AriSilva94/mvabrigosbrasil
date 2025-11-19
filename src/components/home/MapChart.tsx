'use client';

import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import brMapData from "@highcharts/map-collection/countries/br/br-all.geo.json";

type MapPoint = {
  "hc-key": string;
  value: number;
  name?: string;
};

const SAMPLE_DATA: MapPoint[] = [
  { "hc-key": "br-sp", value: 100, name: "São Paulo" },
  { "hc-key": "br-mg", value: 80, name: "Minas Gerais" },
  { "hc-key": "br-rj", value: 70, name: "Rio de Janeiro" },
  { "hc-key": "br-pr", value: 70, name: "Paraná" },
  { "hc-key": "br-rs", value: 60, name: "Rio Grande do Sul" },
  { "hc-key": "br-sc", value: 50, name: "Santa Catarina" },
];

export default function MapChart() {
  const options: Highcharts.Options = {
    chart: {
      backgroundColor: "transparent",
    },
    title: { text: undefined },
    credits: { enabled: false },
    legend: {
      enabled: true,
      layout: "vertical",
      align: "left",
      verticalAlign: "bottom",
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        align: "left",
        verticalAlign: "bottom",
      },
    },
    colorAxis: {
      min: 0,
      minColor: "#f0f4ff",
      maxColor: "#1f4acc",
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="font-weight:600">{point.name}</span><br/>Abrigos: <b>{point.value}</b>',
    },
    series: [
      {
        type: "map",
        name: "Abrigos",
        data: SAMPLE_DATA,
        mapData: brMapData as Highcharts.GeoJSON,
        states: {
          hover: {
            color: "#0f2f7c",
          },
        },
        dataLabels: {
          enabled: true,
          format: "{point.name}",
        },
        // TODO: substituir SAMPLE_DATA por dados reais vindos do backend/Supabase.
      },
    ],
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <HighchartsReact highcharts={Highcharts} constructorType="mapChart" options={options} />
    </div>
  );
}
