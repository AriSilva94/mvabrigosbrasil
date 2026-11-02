import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiClient: vi.fn() }));
vi.mock("@/lib/api/client", () => ({ apiClient: mocks.apiClient }));

import {
  getMyVolunteerProfile,
  getPublicVolunteerCards,
  saveMyVolunteerProfile,
} from "./volunteersApi";

const input = {
  name: "Ana",
  telefone: "(11) 99999-9999",
  profissao: "Veterinaria",
  faixa_etaria: "18 a 35",
  genero: "Feminino",
  escolaridade: "Superior",
  estado: "SP",
  cidade: "Sao Paulo",
  disponibilidade: "2h",
  periodo: "Semanal",
  experiencia: "sim",
  atuacao: "Presencial",
  descricao: "Manejo animal",
  comentarios: "",
  referralSource: "Instagram",
  acceptTerms: true,
};

beforeEach(() => vi.clearAllMocks());

describe("volunteers browser API", () => {
  it("loads private and public data through Nest paths with abort signals", async () => {
    const signal = new AbortController().signal;
    mocks.apiClient
      .mockResolvedValueOnce({ volunteer: null })
      .mockResolvedValueOnce({ volunteers: [] });

    await expect(getMyVolunteerProfile(signal)).resolves.toEqual({ volunteer: null });
    await expect(getPublicVolunteerCards(signal)).resolves.toEqual([]);

    expect(mocks.apiClient).toHaveBeenNthCalledWith(1, "/volunteers/me", { signal });
    expect(mocks.apiClient).toHaveBeenNthCalledWith(2, "/volunteers", { signal });
  });

  it("posts the validated D4 referral source to the private Nest endpoint", async () => {
    mocks.apiClient.mockResolvedValue({ ok: true, volunteer: null });

    await saveMyVolunteerProfile(input);

    expect(mocks.apiClient).toHaveBeenCalledWith("/volunteers/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  });
});
