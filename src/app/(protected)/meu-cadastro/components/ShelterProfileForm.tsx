"use client";

import type { FormEvent, JSX } from "react";

import ShelterAuthorizationSection from "./ShelterAuthorizationSection";
import ShelterInfoSection from "./ShelterInfoSection";

export default function ShelterProfileForm(): JSX.Element {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: integrar com backend de atualização de cadastro
  }

  return (
    <form
      onSubmit={handleSubmit}
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
