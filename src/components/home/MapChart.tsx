"use client";

import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import brMapData from "@highcharts/map-collection/countries/br/br-all.geo.json";

type MapPoint = {
  "hc-key": string;
  value: number;
  name?: string;
};

const SAMPLE_DATA: MapPoint[] = [
  { "hc-key": "br-ac", value: 0, name: "Acre" },
  { "hc-key": "br-al", value: 3, name: "Alagoas" },
  { "hc-key": "br-ap", value: 1, name: "Amapá" },
  { "hc-key": "br-am", value: 3, name: "Amazonas" },
  { "hc-key": "br-ba", value: 9, name: "Bahia" },
  { "hc-key": "br-ce", value: 6, name: "Ceará" },
  { "hc-key": "br-df", value: 10, name: "Distrito Federal" },
  { "hc-key": "br-es", value: 7, name: "Espírito Santo" },
  { "hc-key": "br-go", value: 6, name: "Goiás" },
  { "hc-key": "br-ma", value: 1, name: "Maranhão" },
  { "hc-key": "br-mt", value: 3, name: "Mato Grosso" },
  { "hc-key": "br-ms", value: 5, name: "Mato Grosso do Sul" },
  { "hc-key": "br-mg", value: 32, name: "Minas Gerais" },
  { "hc-key": "br-pa", value: 5, name: "Pará" },
  { "hc-key": "br-pb", value: 6, name: "Paraíba" },
  { "hc-key": "br-pr", value: 48, name: "Paraná" },
  { "hc-key": "br-pe", value: 6, name: "Pernambuco" },
  { "hc-key": "br-pi", value: 6, name: "Piauí" },
  { "hc-key": "br-rj", value: 16, name: "Rio de Janeiro" },
  { "hc-key": "br-rn", value: 5, name: "Rio Grande do Norte" },
  { "hc-key": "br-rs", value: 15, name: "Rio Grande do Sul" },
  { "hc-key": "br-ro", value: 0, name: "Rondônia" },
  { "hc-key": "br-rr", value: 1, name: "Roraima" },
  { "hc-key": "br-sc", value: 9, name: "Santa Catarina" },
  { "hc-key": "br-sp", value: 83, name: "São Paulo" },
  { "hc-key": "br-se", value: 1, name: "Sergipe" },
  { "hc-key": "br-to", value: 1, name: "Tocantins" },
];

export default function MapChart() {
  const options: Highcharts.Options = {
    chart: {
      backgroundColor: "transparent",
      spacing: [0, 0, 0, 0],
      height: 420,
      animation: { duration: 50 },
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
      enableDoubleClickZoomTo: true,
      enableMouseWheelZoom: true,
      mouseWheelSensitivity: 1.02,
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
            color: "#bada55",
            borderColor: "#bada55",
          },
        },
        dataLabels: {
          enabled: true,
          formatter() {
            const point = this.point as Highcharts.Point & { value?: number };
            const value = typeof point.value === "number" ? point.value : 0;
            return `${point.name} (${value})`;
          },
          style: { fontSize: "10px" },
          allowOverlap: false,
        },
      },
    ],
    responsive: {
      rules: [
        {
          condition: { maxWidth: 768 },
          chartOptions: {
            chart: { height: 360 },
            legend: {
              align: "center",
              verticalAlign: "bottom",
              layout: "horizontal",
            },
            series: [
              {
                type: "map",
                dataLabels: {
                  enabled: true,
                  style: { fontSize: "8px" },
                },
              },
            ],
          },
        },
      ],
    },
  };

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm">
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="mapChart"
        options={options}
      />
    </div>
  );
}
