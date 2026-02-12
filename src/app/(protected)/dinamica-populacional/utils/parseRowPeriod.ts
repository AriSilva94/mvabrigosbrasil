import type { DynamicsTableRow } from "../types";

const MONTH_LABELS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/**
 * Extrai mês (MM) e ano (YYYY) de uma row da tabela de dinâmica.
 *
 * Formatos suportados:
 *  - referenceDate: "2025-02-01" (YYYY-MM-DD)
 *  - referenceLabel: "fev/2025" (abreviação/YYYY)
 */
export function parseRowPeriod(row: Pick<DynamicsTableRow, "referenceDate" | "referenceLabel">): {
  month: string;
  year: string;
} {
  // Preferir referenceDate (YYYY-MM-DD)
  if (row.referenceDate) {
    const parts = row.referenceDate.split("-");
    if (parts.length >= 2) {
      return { month: parts[1].padStart(2, "0"), year: parts[0] };
    }
  }

  // Fallback: referenceLabel (ex.: "fev/2025")
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
