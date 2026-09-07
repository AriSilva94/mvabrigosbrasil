import { afterEach, describe, expect, it, vi } from "vitest";

import type { ShelterProfileInput } from "./shelterProfileSchema";
import {
  buildAddressCheckPath,
  buildShelterHistoryPath,
  buildShelterProfileFormPayload,
  checkShelterAddress,
  deactivateShelter,
  parseAddressCheckResponse,
  parseProfileValidationResponse,
  parseShelterHistoryResponse,
  parseShelterProfileResponse,
  parseShelterUpsertResponse,
  saveShelterProfile,
} from "./shelterProfileApi";

const apiShelter = {
  shelterType: "private",
  cnpj: "12345678000190",
  name: "Abrigo Esperanca",
  cep: "90000001",
  street: "Rua A",
  number: "101",
  district: "Centro",
  state: "rs",
  city: "Porto Alegre",
  website: "",
  foundationDate: "2020-01-02",
  species: "Caes e gatos",
  additionalSpecies: ["Equinos"],
  hasTemporaryAgreement: true,
  temporaryAgreement: true,
  referralSource: "Busca",
  initialDogs: 10,
  initialCats: 5,
  initialDogsLt: 2,
  initialCatsLt: null,
  authorizedName: "Responsavel",
  authorizedRole: "Presidente",
  authorizedEmail: "responsavel@example.com",
  authorizedPhone: "51999990001",
  acceptTerms: true,
  active: true,
} as const;

const validPayload: ShelterProfileInput = {
  shelterType: "private",
  cnpj: "12.345.678/0001-90",
  shelterName: "Abrigo Esperanca",
  cep: "90000-001",
  street: "Rua A",
  number: 101,
  district: "Centro",
  state: "RS",
  city: "Porto Alegre",
  website: "",
  foundationDate: "2020-01-02",
  species: "Caes e gatos",
  additionalSpecies: ["Equinos"],
  temporaryAgreement: true,
  referralSource: "Busca",
  initialDogs: 10,
  initialCats: 5,
  initialDogsLt: 2,
  initialCatsLt: 1,
  authorizedName: "Responsavel",
  authorizedRole: "Presidente",
  authorizedEmail: "responsavel@example.com",
  authorizedPhone: "(51) 9 9999-0001",
  acceptTerms: true,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("profile response adapters", () => {
  it("accepts the exact profile validation result including a missing profile", () => {
    const response = {
      isValid: false,
      requiresProfileUpdate: true,
      missingFields: ["shelter_type", "document"],
      registerType: "abrigo",
      profileExists: false,
    };

    expect(parseProfileValidationResponse(response)).toEqual(response);
  });

  it("formats the normalized document according to shelter type", () => {
    const temporary = parseShelterProfileResponse({
      shelter: {
        ...apiShelter,
        shelterType: "temporary",
        cnpj: "12345678901",
        hasTemporaryAgreement: false,
        temporaryAgreement: false,
      },
    });
    const organization = parseShelterProfileResponse({ shelter: apiShelter });

    expect(temporary.shelter?.cnpj).toBe("123.456.789-01");
    expect(organization.shelter?.cnpj).toBe("12.345.678/0001-90");
    expect(organization.shelter).toMatchObject({
      cep: "90000-001",
      state: "RS",
      authorizedPhone: "(51) 9 9999-0001",
      additionalSpecies: ["Equinos"],
      temporaryAgreement: true,
      initialCatsLt: null,
      active: true,
    });
  });

  it("keeps a missing shelter as the existing null state", () => {
    expect(parseShelterProfileResponse({ shelter: null })).toEqual({
      shelter: null,
    });
  });

  it("accepts the identical upsert result used by backend no-op saves", () => {
    const response = { ok: true, shelter: apiShelter };

    expect(parseShelterUpsertResponse(response)).toEqual({
      ok: true,
      shelter: expect.objectContaining({
        name: "Abrigo Esperanca",
        cnpj: "12.345.678/0001-90",
      }),
    });
  });

  it.each([
    null,
    {},
    { shelter: "invalid" },
    { shelter: { ...apiShelter, additionalSpecies: null } },
  ])("rejects a malformed shelter response %#", (response) => {
    expect(() => parseShelterProfileResponse(response)).toThrow(
      "Erro ao carregar cadastro.",
    );
  });

  it("rejects malformed validation and upsert envelopes", () => {
    expect(() =>
      parseProfileValidationResponse({ isValid: true }),
    ).toThrow("Erro ao validar perfil");
    expect(() =>
      parseShelterUpsertResponse({ ok: true, shelter: null }),
    ).toThrow("Não foi possível salvar o cadastro.");
  });
});

describe("shelter form adapter", () => {
  function completeFormData() {
    const formData = new FormData();
    for (const [key, value] of Object.entries({
      shelterName: "Lar Temporario",
      cep: "01310-100",
      street: "Avenida Paulista",
      number: "100",
      district: "Bela Vista",
      state: "SP",
      city: "Sao Paulo",
      website: "https://example.com",
      foundationDate: "02/01/2020",
      species: "Caes",
      referralSource: "Indicacao",
      initialDogs: "4",
      initialCats: "3",
      initialDogsLt: "2",
      initialCatsLt: "1",
      authorizedName: "Pessoa Responsavel",
      authorizedRole: "Tutora",
      authorizedEmail: "pessoa@example.com",
      authorizedPhone: "(11) 9 9999-0000",
    })) {
      formData.set(key, value);
    }
    formData.append("additionalSpecies", "Gatos");
    formData.append("additionalSpecies", "Equinos");
    formData.set("temporaryAgreement", "true");
    formData.set("acceptTerms", "on");
    return formData;
  }

  it("puts a temporary shelter CPF in the existing cnpj form contract", () => {
    const payload = buildShelterProfileFormPayload({
      formData: completeFormData(),
      shelter: null,
      shelterType: "temporary",
      documentValue: "123.456.789-01",
      populationEditOnly: false,
    });

    expect(payload).toMatchObject({
      shelterType: "temporary",
      cnpj: "123.456.789-01",
      shelterName: "Lar Temporario",
      foundationDate: "2020-01-02",
      additionalSpecies: ["Gatos", "Equinos"],
      temporaryAgreement: false,
      authorizedPhone: "(11) 9 9999-0000",
      acceptTerms: true,
    });
  });

  it("keeps a non-temporary CNPJ and all nullable population values", () => {
    const formData = completeFormData();
    formData.delete("initialCatsLt");

    expect(
      buildShelterProfileFormPayload({
        formData,
        shelter: null,
        shelterType: "private",
        documentValue: "12.345.678/0001-90",
        populationEditOnly: false,
      }),
    ).toMatchObject({
      shelterType: "private",
      cnpj: "12.345.678/0001-90",
      temporaryAgreement: true,
      initialDogsLt: "2",
      initialCatsLt: null,
    });
  });
});

describe("history and address adapters", () => {
  it("uses encoded URLSearchParams for history pagination", () => {
    expect(buildShelterHistoryPath(20, 40)).toBe(
      "/shelters/me/history?limit=20&offset=40",
    );
  });

  it("uses encoded URLSearchParams for duplicate address checks", () => {
    expect(
      buildAddressCheckPath("01310-100", "Rua Sao Joao & Filhos", "10/A"),
    ).toBe(
      "/shelters/check-address?cep=01310-100&street=Rua+Sao+Joao+%26+Filhos&number=10%2FA",
    );
  });

  it("maps a duplicate address response without dropping shelter fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            exists: true,
            count: 1,
            shelters: [
              {
                name: "Abrigo Vizinho",
                street: "Rua A",
                number: 101,
                city: "Porto Alegre",
                state: "RS",
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(checkShelterAddress("90000-001")).resolves.toEqual({
      exists: true,
      count: 1,
      shelters: [
        {
          name: "Abrigo Vizinho",
          street: "Rua A",
          number: 101,
          city: "Porto Alegre",
          state: "RS",
        },
      ],
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/shelters/check-address?cep=90000-001",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("treats missing-profile history as an exhausted empty page", () => {
    expect(parseShelterHistoryResponse({ history: [] }, 20, 0)).toEqual({
      history: [],
      total: 0,
      limit: 20,
      offset: 0,
    });
  });

  it("maps history values and labels while preserving no-change records", () => {
    const response = parseShelterHistoryResponse(
      {
        history: [
          {
            id: "history-1",
            shelter_id: "shelter-1",
            profile_id: "profile-1",
            operation: "UPDATE",
            old_data: { active: true, additional_species: [] },
            new_data: { active: false, additional_species: ["Equinos"] },
            changed_fields: ["active", "additional_species"],
            changed_at: "2026-09-07T12:00:00.000Z",
            changed_by: "profile-1",
          },
          {
            id: "history-2",
            shelter_id: "shelter-1",
            profile_id: "profile-1",
            operation: "UPDATE",
            old_data: {},
            new_data: {},
            changed_fields: [],
            changed_at: "2026-09-07T11:00:00.000Z",
            changed_by: null,
          },
        ],
        total: 2,
        limit: 20,
        offset: 0,
      },
      20,
      0,
    );

    expect(response.history[0].changes).toEqual([
      { field: "active", label: "Status", from: "Ativo", to: "Inativo" },
      {
        field: "additional_species",
        label: "Espécies Adicionais",
        from: "-",
        to: "Equinos",
      },
    ]);
    expect(response.history[1].changes).toEqual([]);
  });

  it("rejects malformed history and duplicate-address envelopes", () => {
    expect(() =>
      parseShelterHistoryResponse({ history: "invalid" }, 20, 0),
    ).toThrow("Erro ao carregar histórico");
    expect(() =>
      parseShelterHistoryResponse({ history: [], total: "0" }, 20, 0),
    ).toThrow("Erro ao carregar histórico");
    expect(() =>
      parseAddressCheckResponse({ exists: true, count: 1, shelters: null }),
    ).toThrow("Erro ao verificar endereço");
  });
});

describe("shelter writes", () => {
  it("preserves deactivate and reactivate results", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            active: false,
            message: "Cadastro inativado com sucesso",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            active: true,
            message: "Cadastro reativado com sucesso",
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetcher);

    await expect(deactivateShelter()).resolves.toMatchObject({ active: false });
    await expect(deactivateShelter()).resolves.toMatchObject({ active: true });
    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/shelters/me/deactivate",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("surfaces the backend 403 message for disabled-team writes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ error: "Acesso negado" }), {
          status: 403,
        }),
      ),
    );

    await expect(saveShelterProfile(validPayload)).rejects.toMatchObject({
      status: 403,
      message: "Acesso negado",
    });
  });
});
