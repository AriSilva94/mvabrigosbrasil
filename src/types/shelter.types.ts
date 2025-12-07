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
  hasTemporaryAgreement: boolean | null;
  initialDogs: number;
  initialCats: number;
  authorizedName: string;
  authorizedRole: string;
  authorizedEmail: string;
  authorizedPhone: string;
  acceptTerms: boolean;
}

export type ShelterFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
};

export type NumericInputProps = InputHTMLAttributes<HTMLInputElement>;
