import { STATE_METADATA } from "@/lib/database/stateMetadata";

export const VOLUNTEER_STATE_FILTERS = [
  { value: "", label: "Todos os Estados" },
  ...STATE_METADATA.map(({ code, label }) => ({ value: code, label })),
];

export const VOLUNTEER_GENDER_FILTERS = [
  { value: "", label: "Todos os Gêneros" },
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
];

export const VOLUNTEER_AVAILABILITY_FILTERS = [
  { value: "", label: "Todas as Disponibilidades" },
  { value: "1h", label: "1h" },
  { value: "2h", label: "2h" },
  { value: "3h", label: "3h" },
  { value: "4h", label: "4h" },
  { value: "5h", label: "5h" },
  { value: "6h", label: "6h" },
  { value: "7h", label: "7h" },
  { value: "8h", label: "8h" },
];
