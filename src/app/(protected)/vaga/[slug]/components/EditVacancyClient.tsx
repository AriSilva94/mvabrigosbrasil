"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import SelectField from "@/components/data/SelectField";
import { Heading, Text } from "@/components/ui/typography";
import {
  AREA_OPTIONS,
  DEMAND_OPTIONS,
  PERIOD_OPTIONS,
  WORKLOAD_OPTIONS,
  normalizeWorkload,
} from "@/app/(protected)/minhas-vagas/constants";
import {
  vacancyFormSchema,
  type VacancyFormInput,
} from "@/app/(protected)/minhas-vagas/schema";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";

type EditVacancyClientProps = {
  vacancy: UiVacancy;
};

type FieldErrors = Partial<Record<keyof VacancyFormInput, string>>;

export default function EditVacancyClient({ vacancy }: EditVacancyClientProps) {
  const router = useRouter();
  const [period, setPeriod] = useState(vacancy.period ?? "");
  const [workload, setWorkload] = useState(normalizeWorkload(vacancy.workload));
  const [demand, setDemand] = useState(vacancy.demand ?? "");
  const [area, setArea] = useState(vacancy.area ?? "");
  const [quantity, setQuantity] = useState(vacancy.quantity ?? "");
  const [isPublished, setIsPublished] = useState(vacancy.isPublished ?? true);
  const [title, setTitle] = useState(vacancy.title ?? "");
  const [description, setDescription] = useState(vacancy.description ?? "");
  const [skills, setSkills] = useState(vacancy.skills ?? "");
  const [profile, setProfile] = useState(vacancy.volunteerProfile ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const vacancyId = useMemo(() => vacancy.id, [vacancy.id]);

  function renderError(message?: string) {
    return (
      <p className="min-h-4.5 text-xs font-medium text-red-600">
        {message ?? "\u00A0"}
      </p>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const payload: VacancyFormInput = {
      post_abrigo: "",
      post_estado: "",
      post_cidade: "",
      post_title: title,
      post_periodo: period,
      post_carga: workload,
      post_tipo_demanda: demand,
      post_area_atuacao: area,
      post_quantidade: quantity,
      post_is_published: isPublished,
      post_content: description,
      post_habilidades_e_funcoes: skills,
      post_perfil_dos_voluntarios: profile,
    };

    const parsed = vacancyFormSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
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
    setIsSaving(true);
    try {
      const response = await fetch(`/api/vacancies/${vacancyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Erro ao atualizar vaga");
      }

      toast.success("Vaga atualizada com sucesso!");
      router.refresh();
      router.push("/minhas-vagas");
    } catch (error) {
      console.error("EditVacancyClient: erro ao atualizar vaga", error);
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar vaga. Tente novamente.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(16,130,89,0.06)]"
    >
      <header className="space-y-1">
        <Heading as="h2" className="text-xl font-semibold text-brand-secondary">
          Editar Vaga
        </Heading>
        <Text className="text-sm text-[#68707b]">
          Atualize as informações da vaga e clique em salvar.
        </Text>
      </header>

      <div className="grid gap-4 md:grid-cols-1">
        <div className="space-y-1">
          <label className="flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary">
            <span className="inline-flex items-center gap-1">
              Título <span className="text-red-500">*</span>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              name="post_title"
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-[#4f5765] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              placeholder="Ex: Voluntário para eventos de adoção"
            />
          </label>
          {renderError(errors.post_title)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

        <div className="space-y-1">
          <label className="flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary">
            <span className="inline-flex items-center gap-1">
              Quantidade de Vagas <span className="text-red-500">*</span>
            </span>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              name="post_quantidade"
              type="number"
              min="1"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-[#4f5765] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              placeholder="Ex: 5"
            />
          </label>
          {renderError(errors.post_quantidade)}
        </div>

        <div className="space-y-1">
          <fieldset>
            <legend className="text-sm font-semibold text-brand-secondary mb-2">
              Vaga Publicada? <span className="text-red-500">*</span>
            </legend>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="post_is_published"
                  value="true"
                  checked={isPublished === true}
                  onChange={() => setIsPublished(true)}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-[#4f5765]">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="post_is_published"
                  value="false"
                  checked={isPublished === false}
                  onChange={() => setIsPublished(false)}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-[#4f5765]">Não</span>
              </label>
            </div>
          </fieldset>
          {renderError(errors.post_is_published)}
        </div>
      </div>

      <div className="space-y-1">
        <label className="flex w-full flex-col gap-2 text-sm font-semibold text-brand-secondary">
          <span className="inline-flex items-center gap-1">
            Descrição <span className="text-red-500">*</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
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
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            name="post_perfil_dos_voluntarios"
            rows={3}
            placeholder="Descreva o perfil esperado. Ex: estudantes de Medicina Veterinária entre 18 e 25 anos."
            className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-[#4f5765] shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </label>
        {renderError(errors.post_perfil_dos_voluntarios)}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/minhas-vagas")}
          className="inline-flex items-center rounded-full bg-[#f5f5f6] px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,130,89,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isSaving}
          className="inline-flex min-w-35 items-center justify-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
