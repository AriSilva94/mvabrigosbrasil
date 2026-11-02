import type { VolunteerProfileFormData } from "@/types/volunteer.types";

export function getVolunteerControlledFields(
  volunteer: Partial<VolunteerProfileFormData> | null,
) {
  return {
    telefone: volunteer?.telefone ?? "",
    estado: volunteer?.estado ?? "",
    cidade: volunteer?.cidade ?? "",
    faixaEtaria: volunteer?.faixa_etaria ?? "",
    genero: volunteer?.genero ?? "",
    escolaridade: volunteer?.escolaridade ?? "",
    disponibilidade: volunteer?.disponibilidade ?? "",
    periodo: volunteer?.periodo ?? "",
    experiencia: volunteer?.experiencia ?? "",
    atuacao: volunteer?.atuacao ?? "",
    referralSource: volunteer?.referral_source ?? "",
  };
}
