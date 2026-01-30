import type { DynamicsTableRow } from "../types";

export type FlowType = "entrada" | "saida" | "indicador";

export type MetricColumn = {
  key: keyof DynamicsTableRow["metrics"];
  label: string;
  species: "dogs" | "cats";
};

export type GroupedHeader = {
  label: string;
  flowType: FlowType;
  tooltip: string;
};

export const METRIC_COLUMNS: MetricColumn[] = [
  { key: "entriesDogs", label: "Entradas", species: "dogs" },
  { key: "entriesCats", label: "Entradas", species: "cats" },
  { key: "returnsDogs", label: "Devoluções", species: "dogs" },
  { key: "returnsCats", label: "Devoluções", species: "cats" },
  { key: "adoptionsDogs", label: "Adoções", species: "dogs" },
  { key: "adoptionsCats", label: "Adoções", species: "cats" },
  { key: "euthanasiasDogs", label: "Eutanásias", species: "dogs" },
  { key: "euthanasiasCats", label: "Eutanásias", species: "cats" },
  { key: "naturalDeathsDogs", label: "Mortes Naturais", species: "dogs" },
  { key: "naturalDeathsCats", label: "Mortes Naturais", species: "cats" },
  { key: "diseasesDogs", label: "Doenças", species: "dogs" },
  { key: "diseasesCats", label: "Doenças", species: "cats" },
  { key: "tutorReturnDogs", label: "Retorno Tutor", species: "dogs" },
  { key: "tutorReturnCats", label: "Retorno Tutor", species: "cats" },
  { key: "originReturnDogs", label: "Retorno Origem", species: "dogs" },
  { key: "originReturnCats", label: "Retorno Origem", species: "cats" },
];

export const GROUPED_HEADERS: GroupedHeader[] = [
  {
    label: "Entradas",
    flowType: "entrada",
    tooltip: "Animais que chegaram ao abrigo no período",
  },
  {
    label: "Devoluções",
    flowType: "entrada",
    tooltip: "Animais devolvidos ao abrigo após adoção",
  },
  {
    label: "Adoções",
    flowType: "saida",
    tooltip: "Animais que foram adotados e saíram do abrigo",
  },
  {
    label: "Eutanásias",
    flowType: "saida",
    tooltip: "Animais que foram eutanasiados",
  },
  {
    label: "Mortes Naturais",
    flowType: "saida",
    tooltip: "Animais que morreram por causas naturais",
  },
  {
    label: "Doenças",
    flowType: "indicador",
    tooltip: "Animais diagnosticados com doenças (indicador de saúde)",
  },
  {
    label: "Retorno Tutor",
    flowType: "saida",
    tooltip: "Animais devolvidos ao tutor original",
  },
  {
    label: "Retorno Origem",
    flowType: "saida",
    tooltip: "Animais devolvidos ao local de origem",
  },
];

export const METRIC_GROUPS = GROUPED_HEADERS.map((header) => ({
  ...header,
  metrics: METRIC_COLUMNS.filter((column) => column.label === header.label),
}));

export const FLOW_STYLES: Record<FlowType, { border: string; bg: string; text: string }> = {
  entrada: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  saida: {
    border: "border-rose-300",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  indicador: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
};

export const formatMetricValue = (value: number | null): string =>
  typeof value === "number" ? String(value) : "—";
