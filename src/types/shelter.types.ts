import type { InputHTMLAttributes, ReactNode } from "react";

export interface Shelter {
  id: string;
  name?: string;
}

export type ShelterType = "public" | "private" | "mixed" | "temporary";

export interface ShelterTypeOption {
  value: ShelterType;
  label: string;
  description: string;
}

export interface SpeciesOption {
  value: string;
  label: string;
}

export interface ShelterProfileFormData {
  shelterType: ShelterType;
  cnpj: string;
  name: string;
  cep: string;
  street: string;
  number: string;
  district: string;
  state: string;
  city: string;
  website: string;
  foundationDate: string;
  species: string;
  additionalSpecies: string[];
  hasTemporaryAgreement?: boolean | null;
  temporaryAgreement?: string | null;
  referralSource?: string;
  initialDogs: number;
  initialCats: number;
  authorizedName: string;
  authorizedRole: string;
  authorizedEmail: string;
  authorizedPhone: string;
  acceptTerms: boolean;
  active?: boolean;
}

export type ShelterFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
};

export type NumericInputProps = InputHTMLAttributes<HTMLInputElement>;

// Tipos para Histórico de Alterações
export type ShelterHistoryOperation = "INSERT" | "UPDATE" | "DELETE" | "STATUS_CHANGE";

export interface ShelterHistoryRecord {
  id: string;
  shelter_id: string;
  profile_id: string;
  operation: ShelterHistoryOperation;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: string[];
  changed_at: string;
  changed_by: string | null;
}

export interface ShelterHistoryChange {
  field: string;
  label: string;
  from: string;
  to: string;
}

export interface ShelterHistoryItem {
  id: string;
  operation: ShelterHistoryOperation;
  changedFields: string[];
  changedAt: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  changes?: ShelterHistoryChange[];
}
