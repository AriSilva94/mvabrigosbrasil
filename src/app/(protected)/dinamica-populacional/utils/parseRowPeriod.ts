import type { DynamicsTableRow } from "../types";

const MONTH_LABELS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function parseRowPeriod(row: Pick<DynamicsTableRow, "referenceDate" | "referenceLabel">): {
  month: string;
  year: string;
} {
  if (row.referenceDate) {
    const parts = row.referenceDate.split("-");
    if (parts.length >= 2) {
      return { month: parts[1].padStart(2, "0"), year: parts[0] };
    }
  }

  const label = row.referenceLabel;
  if (label && label.includes("/")) {
    const [abbrev, year] = label.split("/");
    const monthIndex = MONTH_LABELS.indexOf(abbrev.toLowerCase());
    if (monthIndex !== -1) {
      return { month: String(monthIndex + 1).padStart(2, "0"), year };
    }
  }

  return { month: "01", year: String(new Date().getFullYear()) };
}
