import { z } from "zod";

import type {
  VolunteerCard,
  VolunteerProfile,
  VolunteerProfileFormData,
} from "@/types/volunteer.types";

const optionalString = z.string().optional();

const volunteerFormSchema = z.object({
  name: z.string(),
  telefone: z.string(),
  profissao: z.string(),
  faixa_etaria: z.string(),
  genero: z.string(),
  escolaridade: z.string(),
  estado: z.string(),
  cidade: z.string(),
  disponibilidade: z.string(),
  periodo: z.string(),
  experiencia: z.string(),
  atuacao: z.string(),
  descricao: z.string(),
  comentarios: optionalString,
  referral_source: optionalString,
  acceptTerms: z.boolean(),
  is_public: z.boolean().optional(),
});

const volunteerCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  location: optionalString,
  city: optionalString,
  state: optionalString,
  gender: optionalString,
  availability: optionalString,
  period: optionalString,
  experience: optionalString,
  profession: optionalString,
  createdAt: optionalString,
  wpPostId: optionalString,
  source: z.enum(["wp", "new"]).optional(),
});

const volunteerProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  city: optionalString,
  state: optionalString,
  profession: optionalString,
  schooling: optionalString,
  phone: optionalString,
  email: optionalString,
  ageRange: optionalString,
  experience: optionalString,
  availability: optionalString,
  skills: optionalString,
  period: optionalString,
  notes: optionalString,
  createdAt: optionalString,
  wpPostId: optionalString,
  source: z.enum(["wp", "new"]).optional(),
});

function contractError(action: string, error: unknown): never {
  throw new TypeError(`Resposta inválida ao ${action}.`, { cause: error });
}

export function parseVolunteerProfileResponse(value: unknown): {
  volunteer: Partial<VolunteerProfileFormData> | null;
} {
  try {
    return z.object({ volunteer: volunteerFormSchema.nullable() }).parse(value);
  } catch (error) {
    return contractError("carregar cadastro de voluntário", error);
  }
}

export function parseVolunteerCards(value: unknown): VolunteerCard[] {
  try {
    return z.object({ volunteers: z.array(volunteerCardSchema) }).parse(value).volunteers;
  } catch (error) {
    return contractError("listar voluntários", error);
  }
}

export function parseVolunteerProfile(value: unknown): VolunteerProfile {
  try {
    return volunteerProfileSchema.parse(value);
  } catch (error) {
    return contractError("carregar perfil público de voluntário", error);
  }
}
