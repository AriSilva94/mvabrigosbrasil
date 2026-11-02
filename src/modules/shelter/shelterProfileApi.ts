import { z } from "zod";

import { isRegisterType, type RegisterType } from "@/constants/registerTypes";
import { apiClient } from "@/lib/api/client";
import { formatCep, formatCnpj, formatCpf, formatPhone } from "@/lib/formatters";
import type {
  ShelterHistoryChange,
  ShelterHistoryItem,
  ShelterProfileFormData,
} from "@/types/shelter.types";
import { buildPopulationPayload } from "./populationEditHelpers";
import type { ShelterProfileInput } from "./shelterProfileSchema";

export type ProfileValidationResult = {
  isValid: boolean;
  requiresProfileUpdate: boolean;
  missingFields: string[];
  registerType: RegisterType | null;
  profileExists: boolean;
};

export type AddressCheckResult = {
  exists: boolean;
  count: number;
  shelters: Array<{
    name: string;
    street: string;
    number: number;
    city: string;
    state: string;
  }>;
};

export type ShelterDeactivateResult = {
  ok: true;
  active: boolean;
  message: string;
};

type ShelterProfileResponse = {
  shelter: Partial<ShelterProfileFormData> | null;
};

type ShelterUpsertResponse = {
  ok: true;
  shelter: Partial<ShelterProfileFormData>;
};

type ShelterHistoryPage = {
  history: ShelterHistoryItem[];
  total: number;
  limit: number;
  offset: number;
};

const shelterTypeSchema = z.enum(["public", "private", "mixed", "temporary"]);
const nullableBooleanSchema = z.boolean().nullable().optional();
const nullableNumberSchema = z.number().nullable().optional();

const shelterSchema = z
  .object({
    shelterType: shelterTypeSchema.nullable().optional(),
    cnpj: z.string(),
    name: z.string(),
    cep: z.string(),
    street: z.string(),
    number: z.string(),
    district: z.string(),
    state: z.string(),
    city: z.string(),
    website: z.string(),
    foundationDate: z.string(),
    species: z.string(),
    additionalSpecies: z.array(z.string()),
    hasTemporaryAgreement: nullableBooleanSchema,
    temporaryAgreement: nullableBooleanSchema,
    referralSource: z.string().optional(),
    initialDogs: z.number(),
    initialCats: z.number(),
    initialDogsLt: nullableNumberSchema,
    initialCatsLt: nullableNumberSchema,
    authorizedName: z.string(),
    authorizedRole: z.string(),
    authorizedEmail: z.string(),
    authorizedPhone: z.string(),
    acceptTerms: z.boolean(),
    active: z.boolean().optional(),
  })
  .strict();

const profileValidationSchema = z
  .object({
    isValid: z.boolean(),
    requiresProfileUpdate: z.boolean(),
    missingFields: z.array(z.string()),
    registerType: z
      .string()
      .nullable()
      .refine((value) => value === null || isRegisterType(value)),
    profileExists: z.boolean(),
  })
  .strict();

const historyRecordSchema = z
  .object({
    id: z.string(),
    shelter_id: z.string(),
    profile_id: z.string(),
    operation: z.enum(["INSERT", "UPDATE", "DELETE", "STATUS_CHANGE"]),
    old_data: z.record(z.string(), z.unknown()).nullable(),
    new_data: z.record(z.string(), z.unknown()).nullable(),
    changed_fields: z.array(z.string()),
    changed_at: z.string(),
    changed_by: z.string().nullable(),
  })
  .strict();

const historyResponseSchema = z
  .object({
    history: z.array(historyRecordSchema),
    total: z.number().int().nonnegative().optional(),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
  })
  .strict();

const addressCheckSchema = z
  .object({
    exists: z.boolean(),
    count: z.number().int().nonnegative(),
    shelters: z.array(
      z
        .object({
          name: z.string().nullable(),
          street: z.string().nullable(),
          number: z.number().nullable(),
          city: z.string().nullable(),
          state: z.string().nullable(),
        })
        .strict(),
    ),
  })
  .strict();

const deactivateSchema = z
  .object({
    ok: z.literal(true),
    active: z.boolean(),
    message: z.string(),
  })
  .strict();

const FIELD_LABELS: Record<string, string> = {
  shelter_type: "Tipo de Abrigo",
  cnpj: "CNPJ/CPF",
  name: "Nome do Abrigo",
  cep: "CEP",
  street: "Rua",
  number: "Número",
  district: "Bairro",
  state: "Estado",
  city: "Cidade",
  website: "Website",
  foundation_date: "Data de Fundação",
  species: "Espécie Principal",
  additional_species: "Espécies Adicionais",
  temporary_agreement: "Termo de Guarda Temporária",
  initial_dogs: "População Inicial de Cães",
  initial_cats: "População Inicial de Gatos",
  initial_dogs_lt: "População Inicial de Cães L.T",
  initial_cats_lt: "População Inicial de Gatos L.T",
  authorized_name: "Nome do Responsável",
  authorized_role: "Cargo",
  authorized_email: "E-mail",
  authorized_phone: "Telefone",
  active: "Status",
};

function invalidResponse(message: string): never {
  throw new TypeError(message);
}

function formatShelter(
  shelter: z.infer<typeof shelterSchema>,
): Partial<ShelterProfileFormData> {
  return {
    ...shelter,
    shelterType: shelter.shelterType ?? undefined,
    cnpj:
      shelter.shelterType === "temporary"
        ? formatCpf(shelter.cnpj)
        : formatCnpj(shelter.cnpj),
    cep: formatCep(shelter.cep),
    state: shelter.state.toUpperCase(),
    authorizedPhone: formatPhone(shelter.authorizedPhone),
    additionalSpecies: [...shelter.additionalSpecies],
  };
}

export function parseProfileValidationResponse(
  value: unknown,
): ProfileValidationResult {
  const parsed = profileValidationSchema.safeParse(value);
  if (!parsed.success) invalidResponse("Erro ao validar perfil");

  return parsed.data as ProfileValidationResult;
}

export function parseShelterProfileResponse(
  value: unknown,
): ShelterProfileResponse {
  const envelope = z
    .object({ shelter: shelterSchema.nullable() })
    .strict()
    .safeParse(value);
  if (!envelope.success) invalidResponse("Erro ao carregar cadastro.");

  return {
    shelter: envelope.data.shelter
      ? formatShelter(envelope.data.shelter)
      : null,
  };
}

export function parseShelterUpsertResponse(
  value: unknown,
): ShelterUpsertResponse {
  const envelope = z
    .object({ ok: z.literal(true), shelter: shelterSchema })
    .strict()
    .safeParse(value);
  if (!envelope.success) {
    invalidResponse("Não foi possível salvar o cadastro.");
  }

  return { ok: true, shelter: formatShelter(envelope.data.shelter) };
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

function buildChanges(
  record: z.infer<typeof historyRecordSchema>,
): ShelterHistoryChange[] {
  const oldData = record.old_data ?? {};
  const newData = record.new_data ?? {};

  return record.changed_fields.map((field) => ({
    field,
    label: FIELD_LABELS[field] || field,
    from:
      field === "active"
        ? oldData[field]
          ? "Ativo"
          : "Inativo"
        : formatValue(oldData[field]),
    to:
      field === "active"
        ? newData[field]
          ? "Ativo"
          : "Inativo"
        : formatValue(newData[field]),
  }));
}

function mapHistoryRecord(
  record: z.infer<typeof historyRecordSchema>,
): ShelterHistoryItem {
  return {
    id: record.id,
    operation: record.operation,
    changedFields: record.changed_fields.map(
      (field) => FIELD_LABELS[field] || field,
    ),
    changedAt: record.changed_at,
    oldValues: record.old_data || undefined,
    newValues: record.new_data || undefined,
    changes: buildChanges(record),
  };
}

export function parseShelterHistoryResponse(
  value: unknown,
  requestedLimit: number,
  requestedOffset: number,
): ShelterHistoryPage {
  const parsed = historyResponseSchema.safeParse(value);
  if (!parsed.success) invalidResponse("Erro ao carregar histórico");
  if (parsed.data.history.length > 0 && parsed.data.total === undefined) {
    invalidResponse("Erro ao carregar histórico");
  }

  return {
    history: parsed.data.history.map(mapHistoryRecord),
    total: parsed.data.total ?? 0,
    limit: parsed.data.limit ?? requestedLimit,
    offset: parsed.data.offset ?? requestedOffset,
  };
}

export function parseAddressCheckResponse(value: unknown): AddressCheckResult {
  const parsed = addressCheckSchema.safeParse(value);
  if (!parsed.success) invalidResponse("Erro ao verificar endereço");
  return {
    ...parsed.data,
    shelters: parsed.data.shelters.map((shelter) => ({
      name: shelter.name ?? "",
      street: shelter.street ?? "",
      number: shelter.number ?? 0,
      city: shelter.city ?? "",
      state: shelter.state ?? "",
    })),
  };
}

export function parseDeactivateShelterResponse(
  value: unknown,
): ShelterDeactivateResult {
  const parsed = deactivateSchema.safeParse(value);
  if (!parsed.success) {
    invalidResponse("Não foi possível alterar o status do cadastro.");
  }
  return parsed.data;
}

export function buildShelterHistoryPath(limit: number, offset: number): string {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return `/shelters/me/history?${params.toString()}`;
}

export function buildAddressCheckPath(
  cep: string,
  street?: string,
  number?: string | number,
): string {
  const params = new URLSearchParams({ cep });
  if (street) params.set("street", street);
  if (number !== undefined && String(number) !== "") {
    params.set("number", String(number));
  }
  return `/shelters/check-address?${params.toString()}`;
}

type BuildShelterProfileFormPayloadOptions = {
  formData: FormData;
  shelter: Partial<ShelterProfileFormData> | null;
  shelterType: string;
  documentValue: string;
  populationEditOnly: boolean;
};

export function buildShelterProfileFormPayload({
  formData,
  shelter,
  shelterType,
  documentValue,
  populationEditOnly,
}: BuildShelterProfileFormPayloadOptions) {
  if (populationEditOnly) {
    return buildPopulationPayload(shelter, formData);
  }

  const foundationDateRaw = String(formData.get("foundationDate") ?? "");
  const foundationDate =
    foundationDateRaw && foundationDateRaw.includes("/")
      ? foundationDateRaw.split("/").reverse().join("-")
      : foundationDateRaw;
  const nextShelterType =
    shelterType || String(formData.get("shelterType") ?? "");
  const temporaryAgreementValue =
    nextShelterType === "temporary"
      ? false
      : formData.get("temporaryAgreement");

  return {
    shelterType: nextShelterType,
    cnpj: documentValue || String(formData.get("cnpj") ?? ""),
    shelterName: String(formData.get("shelterName") ?? ""),
    cep: String(formData.get("cep") ?? ""),
    street: String(formData.get("street") ?? ""),
    number: formData.get("number"),
    district: String(formData.get("district") ?? ""),
    state: String(formData.get("state") ?? ""),
    city: String(formData.get("city") ?? ""),
    website: String(formData.get("website") ?? ""),
    foundationDate,
    species: String(formData.get("species") ?? ""),
    additionalSpecies: formData.getAll("additionalSpecies").map(String),
    temporaryAgreement:
      typeof temporaryAgreementValue === "boolean"
        ? temporaryAgreementValue
        : temporaryAgreementValue === "true",
    referralSource: String(formData.get("referralSource") ?? ""),
    initialDogs: formData.get("initialDogs"),
    initialCats: formData.get("initialCats"),
    initialDogsLt: formData.get("initialDogsLt"),
    initialCatsLt: formData.get("initialCatsLt"),
    authorizedName: String(formData.get("authorizedName") ?? ""),
    authorizedRole: String(formData.get("authorizedRole") ?? ""),
    authorizedEmail: String(formData.get("authorizedEmail") ?? ""),
    authorizedPhone: String(formData.get("authorizedPhone") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on",
  };
}

export async function getProfileValidation(
  signal?: AbortSignal,
): Promise<ProfileValidationResult> {
  const response = await apiClient<unknown>("/profile/validate", { signal });
  return parseProfileValidationResponse(response);
}

export async function getShelterProfile(
  signal?: AbortSignal,
): Promise<ShelterProfileResponse> {
  const response = await apiClient<unknown>("/shelters/me", { signal });
  return parseShelterProfileResponse(response);
}

export async function saveShelterProfile(
  payload: ShelterProfileInput,
): Promise<ShelterUpsertResponse> {
  const response = await apiClient<unknown>("/shelters/me", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseShelterUpsertResponse(response);
}

export async function getShelterHistory(
  limit: number,
  offset: number,
  signal?: AbortSignal,
): Promise<ShelterHistoryPage> {
  const response = await apiClient<unknown>(buildShelterHistoryPath(limit, offset), {
    signal,
  });
  return parseShelterHistoryResponse(response, limit, offset);
}

export async function checkShelterAddress(
  cep: string,
  street?: string,
  number?: string | number,
  signal?: AbortSignal,
): Promise<AddressCheckResult> {
  const response = await apiClient<unknown>(
    buildAddressCheckPath(cep, street, number),
    { signal },
  );
  return parseAddressCheckResponse(response);
}

export async function deactivateShelter(): Promise<ShelterDeactivateResult> {
  const response = await apiClient<unknown>("/shelters/me/deactivate", {
    method: "POST",
  });
  return parseDeactivateShelterResponse(response);
}
