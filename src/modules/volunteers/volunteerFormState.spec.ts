import { describe, expect, it } from "vitest";

import { getVolunteerControlledFields } from "./volunteerFormState";

describe("volunteer form state", () => {
  it("hydrates controlled fields including referral_source", () => {
    expect(
      getVolunteerControlledFields({
        telefone: "11999999999",
        estado: "SP",
        cidade: "Campinas",
        faixa_etaria: "18 a 35",
        genero: "Feminino",
        escolaridade: "Superior",
        disponibilidade: "2h",
        periodo: "Semanal",
        experiencia: "sim",
        atuacao: "Presencial",
        referral_source: "Instagram",
        is_public: false,
      }),
    ).toEqual({
      telefone: "11999999999",
      estado: "SP",
      cidade: "Campinas",
      faixaEtaria: "18 a 35",
      genero: "Feminino",
      escolaridade: "Superior",
      disponibilidade: "2h",
      periodo: "Semanal",
      experiencia: "sim",
      atuacao: "Presencial",
      referralSource: "Instagram",
    });
  });

  it("uses empty controlled values for a new profile", () => {
    expect(getVolunteerControlledFields(null)).toEqual({
      telefone: "",
      estado: "",
      cidade: "",
      faixaEtaria: "",
      genero: "",
      escolaridade: "",
      disponibilidade: "",
      periodo: "",
      experiencia: "",
      atuacao: "",
      referralSource: "",
    });
  });
});
