"use client";

import Select from "@/components/ui/Select";

// Estados brasileiros
const VACANCY_STATE_FILTERS = [
  { value: "", label: "Todos os Estados" },
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const VACANCY_WORKLOAD_FILTERS = [
  { value: "", label: "Todas as Cargas Horárias" },
  { value: "1h", label: "1h" },
  { value: "2h", label: "2h" },
  { value: "3h", label: "3h" },
  { value: "4h", label: "4h" },
  { value: "5h", label: "5h" },
  { value: "8h", label: "8h" },
];

interface VacancyFiltersPublicProps {
  selectedState: string;
  selectedWorkload: string;
  onStateChange: (state: string) => void;
  onWorkloadChange: (workload: string) => void;
}

export default function VacancyFiltersPublic({
  selectedState,
  selectedWorkload,
  onStateChange,
  onWorkloadChange,
}: VacancyFiltersPublicProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="vacancy-state-filter"
          className="mb-2 block text-sm font-medium text-[#68707b]"
        >
          Estado
        </label>
        <Select
          id="vacancy-state-filter"
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
        >
          {VACANCY_STATE_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="vacancy-workload-filter"
          className="mb-2 block text-sm font-medium text-[#68707b]"
        >
          Carga Horária
        </label>
        <Select
          id="vacancy-workload-filter"
          value={selectedWorkload}
          onChange={(e) => onWorkloadChange(e.target.value)}
        >
          {VACANCY_WORKLOAD_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
