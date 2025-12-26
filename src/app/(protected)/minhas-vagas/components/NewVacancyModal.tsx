"use client";

import { useState } from "react";
import { X } from "lucide-react";

import SelectField from "@/components/data/SelectField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  AREA_OPTIONS,
  DEMAND_OPTIONS,
  PERIOD_OPTIONS,
  WORKLOAD_OPTIONS,
} from "@/app/(protected)/minhas-vagas/constants";
import { vacancyFormSchema, type VacancyFormInput } from "@/app/(protected)/minhas-vagas/schema";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";

type NewVacancyModalProps = {
  open: boolean;
  onClose: () => void;
  shelterName: string | null;
  onCreated: (vacancy: UiVacancy) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export default function NewVacancyModal({
  open,
  onClose,
  shelterName,
  onCreated,
  onRefresh,
  isRefreshing = false,
}: NewVacancyModalProps) {
  const [period, setPeriod] = useState("");
  const [workload, setWorkload] = useState("");
  const [demand, setDemand] = useState("");
  const [area, setArea] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof VacancyFormInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setPeriod("");
    setWorkload("");
    setDemand("");
    setArea("");
    setErrors({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const formData = new FormData(event.currentTarget);
    const payload: VacancyFormInput = {
      post_abrigo: shelterName ?? "",
      post_estado: "",
      post_cidade: "",
      post_title: String(formData.get("post_title") ?? ""),
      post_periodo: String(period ?? ""),
      post_quantidade: Number(formData.get("post_quantidade") ?? 0),
      post_carga: String(workload ?? ""),
      post_tipo_demanda: String(demand ?? ""),
      post_area_atuacao: String(area ?? ""),
      post_content: String(formData.get("post_content") ?? ""),
      post_habilidades_e_funcoes: String(
        formData.get("post_habilidades_e_funcoes") ?? ""
      ),
      post_perfil_dos_voluntarios: String(
        formData.get("post_perfil_dos_voluntarios") ?? ""
      ),
    };

    const parsed = vacancyFormSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof VacancyFormInput, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          nextErrors[path as keyof VacancyFormInput] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    fetch("/api/vacancies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error || "Erro ao salvar vaga");
        }
        if (json?.vacancy) onCreated(json.vacancy as UiVacancy);
        if (onRefresh) onRefresh();
        handleClose();
      })
      .catch((error) => {
        console.error("NewVacancyModal: erro ao salvar", error);
      })
      .finally(() => setIsSubmitting(false));
  }

  const renderError = (message?: string) => (
    <p className="min-h-[18px] text-xs font-medium text-red-600">
      {message ?? "\u00A0"}
    </p>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!next ? handleClose() : undefined)}
    >
      <DialogContent className="w-full max-w-5xl px-4 py-5 sm:px-6 md:px-7 md:py-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-3 sm:gap-4">
          <DialogTitle className="text-xl text-brand-secondary">
            Cadastrar Nova Vaga
          </DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 sm:space-y-4">
          <input type="hidden" name="post_abrigo" value={shelterName ?? ""} />
          <input type="hidden" name="post_estado" value="" />
          <input type="hidden" name="post_cidade" value="" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary">
                <span className="inline-flex items-center gap-1">
                  Título <span className="text-red-500">*</span>
                </span>
                <input
                  name="post_title"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-[#4f5765] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  placeholder="Ex: Voluntário para eventos de adoção"
                />
              </label>
              {renderError(errors.post_title)}
            </div>

            <div className="space-y-1">
              <SelectField
                id="post_periodo"
                name="post_periodo"
                label="Período"
                value={period}
                placeholder="Selecione"
                options={PERIOD_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
                onChange={setPeriod}
                showRequiredAsterisk
              />
              {renderError(errors.post_periodo)}
            </div>

            <div className="space-y-1">
              <label className="flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary">
                <span className="inline-flex items-center gap-1">
                  Quantidade de Vagas <span className="text-red-500">*</span>
                </span>
                <input
                  name="post_quantidade"
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-[#4f5765] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  placeholder="Ex: 3"
                />
              </label>
              {renderError(errors.post_quantidade)}
            </div>

            <div className="space-y-1">
              <SelectField
                id="post_carga"
                name="post_carga"
                label="Carga Horária"
                value={workload}
                placeholder="Selecione"
                options={WORKLOAD_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
                onChange={setWorkload}
                showRequiredAsterisk
              />
              {renderError(errors.post_carga)}
            </div>

            <div className="space-y-1">
              <SelectField
                id="post_tipo_demanda"
                name="post_tipo_demanda"
                label="Tipo Demanda"
                value={demand}
                placeholder="Selecione"
                options={DEMAND_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
                onChange={setDemand}
                showRequiredAsterisk
              />
              {renderError(errors.post_tipo_demanda)}
            </div>

            <div className="space-y-1">
              <SelectField
                id="post_area_atuacao"
                name="post_area_atuacao"
                label="Área de Atuação"
                value={area}
                placeholder="Selecione"
                options={AREA_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
                onChange={setArea}
                showRequiredAsterisk
              />
              {renderError(errors.post_area_atuacao)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary">
              <span className="inline-flex items-center gap-1">
                Descrição <span className="text-red-500">*</span>
              </span>
              <textarea
                name="post_content"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-[#4f5765] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
            </label>
            {renderError(errors.post_content)}
          </div>

          <div className="space-y-1">
            <label className="flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary">
              <span className="inline-flex items-center gap-1">
                Habilidade e Funções <span className="text-red-500">*</span>
              </span>
              <textarea
                name="post_habilidades_e_funcoes"
                rows={3}
                placeholder="Descreva quais funções e habilidades são necessárias para essa vaga."
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-[#4f5765] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
            </label>
            {renderError(errors.post_habilidades_e_funcoes)}
          </div>

          <div className="space-y-1">
            <label className="flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary">
              <span className="inline-flex items-center gap-1">
                Perfil dos Voluntários <span className="text-red-500">*</span>
              </span>
              <textarea
                name="post_perfil_dos_voluntarios"
                rows={3}
                placeholder="Descreva o perfil esperado. Ex: estudantes de Medicina Veterinária entre 18 e 25 anos."
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-[#4f5765] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
            </label>
            {renderError(errors.post_perfil_dos_voluntarios)}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isRefreshing}
              className="inline-flex min-w-35 items-center justify-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
