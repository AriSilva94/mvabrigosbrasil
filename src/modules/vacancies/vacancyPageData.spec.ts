import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";

const mocks = vi.hoisted(() => ({ serverApi: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/server", () => ({ serverApi: mocks.serverApi }));

import {
  loadCandidatesPageData,
  loadOwnerVacanciesPageData,
  loadSharedVacancy,
} from "./vacancyPageData";

const vacancy = { id: "v1", title: "Plantao", slug: "plantao-v1", source: "supabase" as const };

beforeEach(() => vi.clearAllMocks());

describe("vacancy server page data", () => {
  it("composes shelter name and application counts for owner list", async () => {
    mocks.serverApi
      .mockResolvedValueOnce({ shelter: { name: "Abrigo", shelterType: null, cnpj: "", cep: "", street: "", number: "", district: "", state: "", city: "", website: "", foundationDate: "", species: "", additionalSpecies: [], initialDogs: 0, initialCats: 0, authorizedName: "", authorizedRole: "", authorizedEmail: "", authorizedPhone: "", acceptTerms: false } })
      .mockResolvedValueOnce({ vacancies: [vacancy] })
      .mockResolvedValueOnce({ applications: [{ id: "a", status: "pending", applied_at: "2026-09-07T00:00:00.000Z", created_at: "2026-09-07T00:00:00.000Z", volunteers: { id: "vol", name: "Ana", cidade: null, estado: null, telefone: null, profissao: null, experiencia: null, slug: null }, thread_id: null }] });
    await expect(loadOwnerVacanciesPageData()).resolves.toEqual({ shelterName: "Abrigo", vacancies: [{ ...vacancy, shelter: "Abrigo", applicationsCount: 1 }] });
    expect(mocks.serverApi).toHaveBeenNthCalledWith(3, "/vacancies/v1/applications");
  });

  it("preserves every vacancy when some application counts fail", async () => {
    const secondVacancy = { ...vacancy, id: "v2", slug: "plantao-v2" };
    const countError = new ApiError(500, "Erro ao carregar candidaturas");
    mocks.serverApi
      .mockResolvedValueOnce({ shelter: { name: "Abrigo", shelterType: null, cnpj: "", cep: "", street: "", number: "", district: "", state: "", city: "", website: "", foundationDate: "", species: "", additionalSpecies: [], initialDogs: 0, initialCats: 0, authorizedName: "", authorizedRole: "", authorizedEmail: "", authorizedPhone: "", acceptTerms: false } })
      .mockResolvedValueOnce({ vacancies: [vacancy, secondVacancy] })
      .mockRejectedValueOnce(countError)
      .mockResolvedValueOnce({ applications: [] });

    await expect(loadOwnerVacanciesPageData()).resolves.toEqual({
      shelterName: "Abrigo",
      vacancies: [
        { ...vacancy, shelter: "Abrigo", applicationsCount: 0 },
        { ...secondVacancy, shelter: "Abrigo", applicationsCount: 0 },
      ],
    });
  });

  it("keeps an absent shelter and empty list empty", async () => {
    mocks.serverApi.mockResolvedValueOnce({ shelter: null }).mockResolvedValueOnce({ vacancies: [] });
    await expect(loadOwnerVacanciesPageData()).resolves.toEqual({ shelterName: null, vacancies: [] });
  });

  it("propagates owner list failures to the error boundary", async () => {
    const error = new ApiError(500, "Erro ao carregar vagas");
    mocks.serverApi.mockRejectedValue(error);
    await expect(loadOwnerVacanciesPageData()).rejects.toBe(error);
  });

  it("loads owner unpublished detail after my-status", async () => {
    mocks.serverApi.mockResolvedValueOnce({ isOwner: true, hasApplied: false, threadId: null, shelterProfileId: null }).mockResolvedValueOnce({ vacancy });
    await expect(loadSharedVacancy("plantao-v1", true)).resolves.toEqual({ vacancy, canEdit: true, hasApplied: false, isAuthenticated: true, threadId: null, shelterProfileId: null });
    expect(mocks.serverApi).toHaveBeenNthCalledWith(1, "/vacancies/plantao-v1/my-status");
    expect(mocks.serverApi).toHaveBeenNthCalledWith(2, "/vacancies/plantao-v1");
  });

  it("loads raw public detail for anonymous optional auth", async () => {
    mocks.serverApi.mockResolvedValueOnce({ isOwner: false, hasApplied: false, threadId: null, shelterProfileId: null }).mockResolvedValueOnce(vacancy);
    await expect(loadSharedVacancy("plantao-v1", false)).resolves.toEqual({ vacancy, canEdit: false, hasApplied: false, isAuthenticated: false, threadId: null, shelterProfileId: null });
    expect(mocks.serverApi).toHaveBeenNthCalledWith(2, "/public/vacancies/plantao-v1");
  });

  it("passes threadId and shelterProfileId from my-status to the page data", async () => {
    mocks.serverApi
      .mockResolvedValueOnce({ isOwner: false, hasApplied: true, threadId: "thread-1", shelterProfileId: "owner-1" })
      .mockResolvedValueOnce(vacancy);
    await expect(loadSharedVacancy("plantao-v1", true)).resolves.toEqual({
      vacancy,
      canEdit: false,
      hasApplied: true,
      isAuthenticated: true,
      threadId: "thread-1",
      shelterProfileId: "owner-1",
    });
  });

  it("returns null only for public detail 404", async () => {
    mocks.serverApi.mockResolvedValueOnce({ isOwner: false, hasApplied: false, threadId: null, shelterProfileId: null }).mockRejectedValueOnce(new ApiError(404, "Vaga não encontrada"));
    await expect(loadSharedVacancy("missing", false)).resolves.toBeNull();
  });

  it("propagates non-404 public failures", async () => {
    mocks.serverApi.mockResolvedValueOnce({ isOwner: false, hasApplied: false, threadId: null, shelterProfileId: null }).mockRejectedValueOnce(new ApiError(500, "Falha"));
    await expect(loadSharedVacancy("broken", false)).rejects.toMatchObject({ status: 500 });
  });

  it("loads protected vacancy and candidates and preserves cross-owner 404", async () => {
    mocks.serverApi.mockResolvedValueOnce({ vacancy }).mockResolvedValueOnce({ applications: [] });
    await expect(loadCandidatesPageData("plantao-v1")).resolves.toEqual({ vacancy, applications: [] });
    const denied = new ApiError(404, "Vaga não encontrada ou sem permissão");
    mocks.serverApi.mockReset().mockRejectedValue(denied);
    await expect(loadCandidatesPageData("outra-vaga")).rejects.toBe(denied);
  });
});
