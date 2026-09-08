import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";

const mocks = vi.hoisted(() => ({ apiClient: vi.fn() }));
vi.mock("@/lib/api/client", () => ({ apiClient: mocks.apiClient }));

import {
  applyToVacancy,
  createVacancy,
  deleteVacancy,
  getMyVacancyStatus,
  getOwnerVacancy,
  getPublicVacancies,
  getPublicVacancy,
  getVacancyApplications,
  getVacancies,
  loadOwnerVacancies,
  updateVacancy,
} from "./vacanciesApi";

const vacancy = {
  id: "vacancy-1",
  title: "Plantao",
  slug: "plantao-vacancy-1",
  city: "Recife",
  state: "PE",
  isPublished: true,
  source: "supabase" as const,
};

const form = {
  post_abrigo: "Abrigo",
  post_estado: "PE",
  post_cidade: "Recife",
  post_title: "Plantao",
  post_periodo: "Noturno",
  post_carga: "4h",
  post_tipo_demanda: "Recorrente",
  post_area_atuacao: "Veterinaria",
  post_quantidade: "2",
  post_is_published: true,
  post_content: "Descricao",
  post_habilidades_e_funcoes: "Triagem",
  post_perfil_dos_voluntarios: "Veterinarios",
};

beforeEach(() => vi.clearAllMocks());

describe("vacancies browser API", () => {
  it("lists protected vacancies and accepts omitted optional JSON fields", async () => {
    mocks.apiClient.mockResolvedValue({ vacancies: [{ id: "v", title: "Vaga", slug: "vaga-v", source: "supabase" }] });
    await expect(getVacancies()).resolves.toHaveLength(1);
    expect(mocks.apiClient).toHaveBeenCalledWith("/vacancies", { signal: undefined });
  });

  it("creates with the exact form body", async () => {
    mocks.apiClient.mockResolvedValue({ vacancy });
    await expect(createVacancy(form)).resolves.toEqual(vacancy);
    expect(mocks.apiClient).toHaveBeenCalledWith("/vacancies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  });

  it("loads and updates protected detail by encoded slug", async () => {
    mocks.apiClient.mockResolvedValue({ vacancy });
    await getOwnerVacancy("plantao/a");
    expect(mocks.apiClient).toHaveBeenLastCalledWith("/vacancies/plantao%2Fa", { signal: undefined });
    await updateVacancy("plantao/a", form);
    expect(mocks.apiClient).toHaveBeenLastCalledWith("/vacancies/plantao%2Fa", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  });

  it("deletes by encoded id or slug", async () => {
    mocks.apiClient.mockResolvedValue({ success: true, message: "Vaga deletada com sucesso" });
    await expect(deleteVacancy("plantao/a")).resolves.toEqual({ success: true, message: "Vaga deletada com sucesso" });
    expect(mocks.apiClient).toHaveBeenCalledWith("/vacancies/plantao%2Fa", { method: "DELETE" });
  });

  it("loads candidates with the singular volunteer record under volunteers", async () => {
    const applications = [{
      id: "app-1", status: "pending", applied_at: "2026-09-07T00:00:00.000Z", created_at: "2026-09-07T00:00:00.000Z",
      volunteers: { id: "vol-1", name: "Ana", cidade: null, estado: "PE", telefone: null, profissao: null, experiencia: null, slug: null },
    }];
    mocks.apiClient.mockResolvedValue({ applications });
    await expect(getVacancyApplications("vacancy-1")).resolves.toEqual(applications);
    expect(mocks.apiClient).toHaveBeenCalledWith("/vacancies/vacancy-1/applications", { signal: undefined });
  });

  it("composes shelter name and candidate counts on client refresh", async () => {
    mocks.apiClient
      .mockResolvedValueOnce({ vacancies: [vacancy] })
      .mockResolvedValueOnce({ applications: [] });
    await expect(loadOwnerVacancies("Abrigo")).resolves.toEqual([
      { ...vacancy, shelter: "Abrigo", applicationsCount: 0 },
    ]);
  });

  it("preserves vacancies when multiple candidate counts fail on client refresh", async () => {
    const secondVacancy = { ...vacancy, id: "vacancy-2", slug: "plantao-vacancy-2" };
    mocks.apiClient
      .mockResolvedValueOnce({ vacancies: [vacancy, secondVacancy] })
      .mockRejectedValueOnce(new ApiError(500, "Falha na primeira contagem"))
      .mockRejectedValueOnce(new ApiError(500, "Falha na segunda contagem"));

    await expect(loadOwnerVacancies("Abrigo")).resolves.toEqual([
      { ...vacancy, shelter: "Abrigo", applicationsCount: 0 },
      { ...secondVacancy, shelter: "Abrigo", applicationsCount: 0 },
    ]);
  });

  it("loads optional-auth status", async () => {
    mocks.apiClient.mockResolvedValue({ isOwner: false, hasApplied: true });
    await expect(getMyVacancyStatus("vacancy-1")).resolves.toEqual({ isOwner: false, hasApplied: true });
    expect(mocks.apiClient).toHaveBeenCalledWith("/vacancies/vacancy-1/my-status", { signal: undefined });
  });

  it("parses public list envelope and raw public detail", async () => {
    const card = { id: "123", title: "Plantao", slug: "plantao", location: "Recife - PE" };
    mocks.apiClient.mockResolvedValueOnce({ vacancies: [card] }).mockResolvedValueOnce(vacancy);
    await expect(getPublicVacancies()).resolves.toEqual([card]);
    await expect(getPublicVacancy("plantao")).resolves.toEqual(vacancy);
    expect(mocks.apiClient).toHaveBeenNthCalledWith(1, "/public/vacancies", { signal: undefined });
    expect(mocks.apiClient).toHaveBeenNthCalledWith(2, "/public/vacancies/plantao", { signal: undefined });
  });

  it("applies with POST and no fabricated body", async () => {
    const result = { success: true, application: { id: "app", vacancy_id: "vacancy-1", volunteer_id: "vol-1", status: "pending", applied_at: "2026-09-07T00:00:00.000Z", created_at: "2026-09-07T00:00:00.000Z", updated_at: "2026-09-07T00:00:00.000Z" } };
    mocks.apiClient.mockResolvedValue(result);
    await expect(applyToVacancy("vacancy-1")).resolves.toEqual(result);
    expect(mocks.apiClient).toHaveBeenCalledWith("/vacancies/vacancy-1/apply", { method: "POST" });
  });

  it.each([
    [409, "Você já se candidatou a esta vaga"],
    [500, "Erro ao criar candidatura"],
  ])("preserves apply ApiError %s and its backend message", async (status, message) => {
    const error = new ApiError(status, message, { error: message });
    mocks.apiClient.mockRejectedValue(error);
    await expect(applyToVacancy("vacancy-1")).rejects.toBe(error);
  });

  it.each([
    [{ vacancies: [{ ...vacancy, extra: true }] }, getVacancies],
    [{ vacancies: vacancy }, getPublicVacancies],
    [{ vacancy: { ...vacancy, source: "legacy" } }, () => getOwnerVacancy("x")],
  ])("rejects malformed strict response %#", async (response, call) => {
    mocks.apiClient.mockResolvedValue(response);
    await expect(call()).rejects.toThrow(/Resposta inválida/);
  });
});
