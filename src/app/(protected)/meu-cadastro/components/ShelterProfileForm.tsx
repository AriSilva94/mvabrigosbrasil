"use client";

import type { FormEvent, JSX } from "react";
import { toast } from "sonner";
import { z } from "zod";

import ShelterAuthorizationSection from "./ShelterAuthorizationSection";
import ShelterInfoSection from "./ShelterInfoSection";

const shelterProfileSchema = z.object({
  shelterType: z.string().min(1, "Selecione o tipo de abrigo."),
  cnpj: z.string().min(1, "Informe o CNPJ."),
  shelterName: z.string().min(1, "Informe o nome do abrigo."),
  cep: z.string().min(1, "Informe o CEP."),
  street: z.string().min(1, "Informe a rua."),
  number: z.coerce.number().min(0, "Informe o número."),
  district: z.string().min(1, "Informe o bairro."),
  state: z.string().min(1, "Selecione o estado."),
  city: z.string().min(1, "Informe a cidade."),
  website: z.string().optional(),
  foundationDate: z.string().min(1, "Informe a fundação do abrigo."),
  species: z.string().min(1, "Informe a espécie principal."),
  additionalSpecies: z.array(z.string()).optional(),
  temporaryAgreement: z.string().optional(),
  initialDogs: z.coerce.number().min(0, "Informe a população inicial de cães."),
  initialCats: z.coerce.number().min(0, "Informe a população inicial de gatos."),
});

export default function ShelterProfileForm(): JSX.Element {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      shelterType: String(formData.get("shelterType") ?? ""),
      cnpj: String(formData.get("cnpj") ?? ""),
      shelterName: String(formData.get("shelterName") ?? ""),
      cep: String(formData.get("cep") ?? ""),
      street: String(formData.get("street") ?? ""),
      number: formData.get("number"),
      district: String(formData.get("district") ?? ""),
      state: String(formData.get("state") ?? ""),
      city: String(formData.get("city") ?? ""),
      website: String(formData.get("website") ?? ""),
      foundationDate: String(formData.get("foundationDate") ?? ""),
      species: String(formData.get("species") ?? ""),
      additionalSpecies: formData.getAll("additionalSpecies").map(String),
      temporaryAgreement: String(formData.get("temporaryAgreement") ?? ""),
      initialDogs: formData.get("initialDogs"),
      initialCats: formData.get("initialCats"),
    };

    const parsed = shelterProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message;
      if (firstError) toast.error(firstError);
      return;
    }

    toast.success("Dados validados. Integração com backend pendente.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex max-w-6xl flex-col gap-10 rounded-2xl bg-white px-6 py-10 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10"
    >
      <ShelterInfoSection />

      <ShelterAuthorizationSection />

      <div className="flex flex-col items-center gap-4 pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-brand-primary px-10 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Salvar Cadastro
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-[#6b7280] transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Inativar Cadastro
        </button>
      </div>
    </form>
  );
}
