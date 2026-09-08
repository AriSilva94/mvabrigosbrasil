import { z } from "zod";

import type { VacancyFormInput } from "@/app/(protected)/minhas-vagas/schema";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import { apiClient } from "@/lib/api/client";
import type { VacancyCard } from "@/types/vacancy.types";

const optionalString = z.string().optional();

const vacancySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  city: optionalString,
  state: optionalString,
  period: optionalString,
  workload: optionalString,
  demand: optionalString,
  area: optionalString,
  quantity: optionalString,
  isPublished: z.boolean().optional(),
  shelter: optionalString,
  description: optionalString,
  skills: optionalString,
  volunteerProfile: optionalString,
  source: z.literal("supabase"),
}).strict();

const vacancyEnvelopeSchema = z.object({ vacancy: vacancySchema }).strict();
const vacanciesEnvelopeSchema = z.object({ vacancies: z.array(vacancySchema) }).strict();

const publicCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  period: optionalString,
  workload: optionalString,
  location: optionalString,
}).strict();
const publicListSchema = z.object({ vacancies: z.array(publicCardSchema) }).strict();

const volunteerSchema = z.object({
  id: z.string(),
  name: z.string(),
  cidade: z.string().nullable(),
  estado: z.string().nullable(),
  telefone: z.string().nullable(),
  profissao: z.string().nullable(),
  experiencia: z.string().nullable(),
  slug: z.string().nullable(),
}).strict();

const applicationWithVolunteerSchema = z.object({
  id: z.string(),
  status: z.string(),
  applied_at: z.string(),
  created_at: z.string(),
  volunteers: volunteerSchema,
}).strict();
const applicationsEnvelopeSchema = z.object({
  applications: z.array(applicationWithVolunteerSchema),
}).strict();

const statusSchema = z.object({
  isOwner: z.boolean(),
  hasApplied: z.boolean(),
}).strict();

const applySchema = z.object({
  success: z.literal(true),
  application: z.object({
    id: z.string(),
    vacancy_id: z.string(),
    volunteer_id: z.string(),
    status: z.string(),
    applied_at: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }).strict(),
}).strict();

const deleteSchema = z.object({
  success: z.literal(true),
  message: z.string(),
}).strict();

export type VacancyApplication = z.infer<typeof applicationWithVolunteerSchema>;
export type VacancyStatus = z.infer<typeof statusSchema>;
export type ApplyVacancyResult = z.infer<typeof applySchema>;

function parse<T>(schema: z.ZodType<T>, value: unknown, operation: string): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new TypeError(`Resposta inválida ao ${operation}.`);
  return result.data;
}

function vacancyPath(identifier: string): string {
  return `/vacancies/${encodeURIComponent(identifier)}`;
}

export function parseVacanciesResponse(value: unknown): UiVacancy[] {
  return parse(vacanciesEnvelopeSchema, value, "carregar vagas").vacancies;
}

export function parseVacancyResponse(value: unknown): UiVacancy {
  return parse(vacancyEnvelopeSchema, value, "carregar vaga").vacancy;
}

export function parsePublicVacancy(value: unknown): UiVacancy {
  return parse(vacancySchema, value, "carregar vaga pública");
}

export function parsePublicVacancies(value: unknown): VacancyCard[] {
  return parse(publicListSchema, value, "carregar vagas públicas").vacancies;
}

export function parseApplications(value: unknown): VacancyApplication[] {
  return parse(applicationsEnvelopeSchema, value, "carregar candidaturas").applications;
}

export function parseVacancyStatus(value: unknown): VacancyStatus {
  return parse(statusSchema, value, "consultar candidatura");
}

export async function getVacancies(signal?: AbortSignal): Promise<UiVacancy[]> {
  return parseVacanciesResponse(await apiClient<unknown>("/vacancies", { signal }));
}

export async function loadOwnerVacancies(
  shelterName: string | null,
  signal?: AbortSignal,
): Promise<UiVacancy[]> {
  const vacancies = await getVacancies(signal);
  return Promise.all(vacancies.map(async (vacancy) => ({
    ...vacancy,
    shelter: shelterName ?? undefined,
    applicationsCount: await loadApplicationCount(vacancy.id, signal),
  })));
}

async function loadApplicationCount(vacancyId: string, signal?: AbortSignal): Promise<number> {
  try {
    return (await getVacancyApplications(vacancyId, signal)).length;
  } catch (error) {
    if (signal?.aborted) throw error;
    return 0;
  }
}

export async function createVacancy(input: VacancyFormInput): Promise<UiVacancy> {
  return parseVacancyResponse(await apiClient<unknown>("/vacancies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }));
}

export async function getOwnerVacancy(identifier: string, signal?: AbortSignal): Promise<UiVacancy> {
  return parseVacancyResponse(await apiClient<unknown>(vacancyPath(identifier), { signal }));
}

export async function updateVacancy(identifier: string, input: VacancyFormInput): Promise<UiVacancy> {
  return parseVacancyResponse(await apiClient<unknown>(vacancyPath(identifier), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }));
}

export async function deleteVacancy(identifier: string) {
  return parse(deleteSchema, await apiClient<unknown>(vacancyPath(identifier), { method: "DELETE" }), "excluir vaga");
}

export async function getVacancyApplications(identifier: string, signal?: AbortSignal): Promise<VacancyApplication[]> {
  return parseApplications(await apiClient<unknown>(`${vacancyPath(identifier)}/applications`, { signal }));
}

export async function getMyVacancyStatus(identifier: string, signal?: AbortSignal): Promise<VacancyStatus> {
  return parseVacancyStatus(await apiClient<unknown>(`${vacancyPath(identifier)}/my-status`, { signal }));
}

export async function getPublicVacancies(signal?: AbortSignal): Promise<VacancyCard[]> {
  return parsePublicVacancies(await apiClient<unknown>("/public/vacancies", { signal }));
}

export async function getPublicVacancy(slug: string, signal?: AbortSignal): Promise<UiVacancy> {
  return parsePublicVacancy(await apiClient<unknown>(`/public/vacancies/${encodeURIComponent(slug)}`, { signal }));
}

export async function applyToVacancy(identifier: string): Promise<ApplyVacancyResult> {
  return parse(applySchema, await apiClient<unknown>(`${vacancyPath(identifier)}/apply`, { method: "POST" }), "enviar candidatura");
}
