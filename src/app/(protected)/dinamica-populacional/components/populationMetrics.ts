import type { DynamicsTableRow } from "../types";

export type MetricColumn = {
  key: keyof DynamicsTableRow["metrics"];
  label: string;
  species: "dogs" | "cats";
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

export const GROUPED_HEADERS = [
  "Entradas",
  "Devoluções",
  "Adoções",
  "Eutanásias",
  "Mortes Naturais",
  "Doenças",
  "Retorno Tutor",
  "Retorno Origem",
];

export const METRIC_GROUPS = GROUPED_HEADERS.map((label) => ({
  label,
  metrics: METRIC_COLUMNS.filter((column) => column.label === label),
}));

export const formatMetricValue = (value: number | null): string =>
  typeof value === "number" ? String(value) : "—";
