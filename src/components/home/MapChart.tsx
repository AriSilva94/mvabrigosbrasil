"use client";

import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import brMapData from "@highcharts/map-collection/countries/br/br-all.geo.json";

export type MapPoint = {
  "hc-key": string;
  value: number;
  name?: string;
};

interface MapChartProps {
  data?: MapPoint[];
  isLoading?: boolean;
}

export default function MapChart({ data, isLoading }: MapChartProps) {
  // Se não houver dados, mostra mapa vazio
  const mapData = data ?? [];
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
        data: mapData,
        mapData: brMapData as Highcharts.GeoJSON,
        states: {
          hover: {
            color: "#bada55",
            borderColor: "#bada55",
          },
        },
        dataLabels: {
          enabled: true,
          format: "{point.name} ({point.value})",
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
                  format: "{point.name} ({point.value})",
                  style: { fontSize: "8px" },
                },
              },
            ],
          },
        },
      ],
    },
  };

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm" style={{ minHeight: "420px" }}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
            <p className="mt-4 text-sm text-slate-600">Carregando dados do mapa...</p>
          </div>
        </div>
      </div>
    );
  }

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
