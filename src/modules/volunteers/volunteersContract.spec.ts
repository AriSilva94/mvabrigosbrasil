import { describe, expect, it } from "vitest";

import {
  parseVolunteerCards,
  parseVolunteerProfile,
  parseVolunteerProfileResponse,
} from "./volunteersContract";

describe("volunteer NestJS contracts", () => {
  it("parses private profile D4 fields without renaming them", () => {
    const volunteer = {
      name: "Ana",
      telefone: "11999999999",
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
      referral_source: "Instagram",
      acceptTerms: true,
      is_public: false,
    };

    expect(parseVolunteerProfileResponse({ volunteer })).toEqual({ volunteer });
    expect(parseVolunteerProfileResponse({ volunteer: null })).toEqual({ volunteer: null });
  });

  it("accepts omitted nullable public fields and keeps generated slugs", () => {
    const card = {
      id: "vol-1",
      name: "Ana",
      slug: "ana-1234abcd",
      state: "SP",
      source: "new",
    };

    expect(parseVolunteerCards({ volunteers: [card] })).toEqual([card]);
    expect(parseVolunteerProfile({ ...card, email: "ana@example.com" })).toMatchObject({
      slug: "ana-1234abcd",
      email: "ana@example.com",
    });
  });

  it("rejects malformed endpoint payloads", () => {
    expect(() => parseVolunteerCards({ volunteers: [{ id: "vol-1" }] })).toThrow(
      "listar voluntários",
    );
    expect(() => parseVolunteerProfileResponse({ volunteer: { name: null } })).toThrow(
      "carregar cadastro de voluntário",
    );
  });
});
