/* eslint-disable react/no-unescaped-entities */
"use client";

import type { FormEvent, JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";

import { FormLoading } from "@/components/loading/FormLoading";
import {
  volunteerProfileSchema,
  type VolunteerProfileInput,
} from "@/modules/volunteer/volunteerProfileSchema";
import { useVolunteerProfile } from "@/hooks/useVolunteerProfile";
import type { VolunteerProfileFormData } from "@/types/volunteer.types";
import Input from "@/components/ui/Input";
import FormError from "@/components/ui/FormError";
import { FormField } from "./FormField";

const FAIXA_ETARIA_OPTIONS = [
  { value: "18 a 35", label: "18 a 35 anos" },
  { value: "36 a 59", label: "36 a 59 anos" },
  { value: "Acima de 60 anos", label: "Acima de 60 anos" },
];

const GENERO_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Nao-binárie", label: "Não-binárie" },
  { value: "Prefiro não declarar", label: "Prefiro não declarar" },
];

const ESCOLARIDADE_OPTIONS = [
  { value: "Fundamental", label: "Fundamental" },
  { value: "Médio", label: "Médio" },
  { value: "Superior", label: "Superior" },
  { value: "Pós-graduação", label: "Pós-graduação" },
  { value: "Mestrado", label: "Mestrado" },
  { value: "Doutorado", label: "Doutorado" },
];

const DISPONIBILIDADE_OPTIONS = [
  { value: "1h", label: "1 hora" },
  { value: "2h", label: "2 horas" },
  { value: "3h", label: "3 horas" },
  { value: "4h", label: "4 horas" },
  { value: "5h", label: "5 horas" },
  { value: "6h", label: "6 horas" },
  { value: "7h", label: "7 horas" },
  { value: "8h", label: "8 horas" },
];

const PERIODO_OPTIONS = [
  { value: "Diário", label: "Diário" },
  { value: "Semanal", label: "Semanal" },
  { value: "Quinzenal", label: "Quinzenal" },
  { value: "Semestral", label: "Semestral" },
];

const EXPERIENCIA_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const ATUACAO_OPTIONS = [
  { value: "Remoto", label: "Remoto" },
  { value: "Presencial", label: "Presencial" },
  { value: "Híbrido", label: "Híbrido" },
];

export default function VolunteerProfileForm(): JSX.Element {
  const { volunteer, isLoading, refresh } = useVolunteerProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof VolunteerProfileInput, string>>
  >({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      telefone: String(formData.get("telefone") ?? ""),
      profissao: String(formData.get("profissao") ?? ""),
      faixa_etaria: String(formData.get("faixa_etaria") ?? ""),
      genero: String(formData.get("genero") ?? ""),
      escolaridade: String(formData.get("escolaridade") ?? ""),
      estado: String(formData.get("estado") ?? ""),
      cidade: String(formData.get("cidade") ?? ""),
      disponibilidade: String(formData.get("disponibilidade") ?? ""),
      periodo: String(formData.get("periodo") ?? ""),
      experiencia: String(formData.get("experiencia") ?? ""),
      atuacao: String(formData.get("atuacao") ?? ""),
      descricao: String(formData.get("descricao") ?? ""),
      comentarios: String(formData.get("comentarios") ?? ""),
      acceptTerms: formData.get("acceptTerms") === "on",
    };

    const parsed = volunteerProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const issues: Partial<Record<keyof VolunteerProfileInput, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          issues[path as keyof VolunteerProfileInput] = issue.message;
        }
      });
      setFieldErrors(issues);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      const response = await fetch("/api/volunteer-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Não foi possível salvar o cadastro.");
      }

      toast.success("Cadastro de voluntário salvo com sucesso.");
      await refresh();
    } catch (error) {
      console.error("Erro ao salvar cadastro de voluntário", error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o cadastro.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formKey = useMemo(
    () => (volunteer ? JSON.stringify(volunteer) : "empty"),
    [volunteer]
  );

  const data: Partial<VolunteerProfileFormData> | null = volunteer ?? null;

  const submitLabel = isLoading
    ? "Carregando..."
    : isSubmitting
    ? "Salvando..."
    : "Salvar Cadastro";

  if (isLoading && !volunteer) {
    return <FormLoading />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      key={formKey}
      className="mx-auto flex max-w-6xl flex-col gap-10 rounded-2xl bg-white px-6 py-10 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#4f5464]">Dados Pessoais</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField id="name" label="Nome Social Completo" required>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={data?.name ?? ""}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className={clsx(
                fieldErrors.name &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="name-error" message={fieldErrors.name} />
          </FormField>

          <FormField id="telefone" label="Telefone" required>
            <Input
              id="telefone"
              name="telefone"
              type="tel"
              autoComplete="tel"
              defaultValue={data?.telefone ?? ""}
              placeholder="(00) 0 0000-0000"
              aria-invalid={Boolean(fieldErrors.telefone)}
              aria-describedby={fieldErrors.telefone ? "telefone-error" : undefined}
              className={clsx(
                fieldErrors.telefone &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="telefone-error" message={fieldErrors.telefone} />
          </FormField>

          <FormField id="profissao" label="Profissão" required>
            <Input
              id="profissao"
              name="profissao"
              type="text"
              defaultValue={data?.profissao ?? ""}
              aria-invalid={Boolean(fieldErrors.profissao)}
              aria-describedby={fieldErrors.profissao ? "profissao-error" : undefined}
              className={clsx(
                fieldErrors.profissao &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="profissao-error" message={fieldErrors.profissao} />
          </FormField>

          <FormField id="faixa_etaria" label="Faixa Etária" required>
            <select
              id="faixa_etaria"
              name="faixa_etaria"
              defaultValue={data?.faixa_etaria ?? ""}
              aria-invalid={Boolean(fieldErrors.faixa_etaria)}
              aria-describedby={fieldErrors.faixa_etaria ? "faixa_etaria-error" : undefined}
              className={clsx(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                fieldErrors.faixa_etaria &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            >
              <option value="">Selecione</option>
              {FAIXA_ETARIA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormError id="faixa_etaria-error" message={fieldErrors.faixa_etaria} />
          </FormField>

          <FormField id="genero" label="Gênero" required>
            <select
              id="genero"
              name="genero"
              defaultValue={data?.genero ?? ""}
              aria-invalid={Boolean(fieldErrors.genero)}
              aria-describedby={fieldErrors.genero ? "genero-error" : undefined}
              className={clsx(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                fieldErrors.genero &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            >
              <option value="">Selecione</option>
              {GENERO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormError id="genero-error" message={fieldErrors.genero} />
          </FormField>

          <FormField id="escolaridade" label="Escolaridade" required>
            <select
              id="escolaridade"
              name="escolaridade"
              defaultValue={data?.escolaridade ?? ""}
              aria-invalid={Boolean(fieldErrors.escolaridade)}
              aria-describedby={fieldErrors.escolaridade ? "escolaridade-error" : undefined}
              className={clsx(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                fieldErrors.escolaridade &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            >
              <option value="">Selecione</option>
              {ESCOLARIDADE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormError id="escolaridade-error" message={fieldErrors.escolaridade} />
          </FormField>

          <FormField id="estado" label="Estado" required>
            <Input
              id="estado"
              name="estado"
              type="text"
              defaultValue={data?.estado ?? ""}
              placeholder="Ex: SP"
              maxLength={2}
              aria-invalid={Boolean(fieldErrors.estado)}
              aria-describedby={fieldErrors.estado ? "estado-error" : undefined}
              className={clsx(
                fieldErrors.estado &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="estado-error" message={fieldErrors.estado} />
          </FormField>

          <FormField id="cidade" label="Cidade" required>
            <Input
              id="cidade"
              name="cidade"
              type="text"
              defaultValue={data?.cidade ?? ""}
              aria-invalid={Boolean(fieldErrors.cidade)}
              aria-describedby={fieldErrors.cidade ? "cidade-error" : undefined}
              className={clsx(
                fieldErrors.cidade &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="cidade-error" message={fieldErrors.cidade} />
          </FormField>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#4f5464]">Disponibilidade</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="disponibilidade"
            label="Disponibilidade de tempo para trabalho voluntário"
            required
          >
            <select
              id="disponibilidade"
              name="disponibilidade"
              defaultValue={data?.disponibilidade ?? ""}
              aria-invalid={Boolean(fieldErrors.disponibilidade)}
              aria-describedby={
                fieldErrors.disponibilidade ? "disponibilidade-error" : undefined
              }
              className={clsx(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                fieldErrors.disponibilidade &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            >
              <option value="">Selecione</option>
              {DISPONIBILIDADE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormError id="disponibilidade-error" message={fieldErrors.disponibilidade} />
          </FormField>

          <FormField
            id="periodo"
            label="Disponibilidade de período para trabalho voluntário"
            required
          >
            <select
              id="periodo"
              name="periodo"
              defaultValue={data?.periodo ?? ""}
              aria-invalid={Boolean(fieldErrors.periodo)}
              aria-describedby={fieldErrors.periodo ? "periodo-error" : undefined}
              className={clsx(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                fieldErrors.periodo &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            >
              <option value="">Selecione</option>
              {PERIODO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormError id="periodo-error" message={fieldErrors.periodo} />
          </FormField>

          <FormField
            id="experiencia"
            label="Tem/teve experiência com trabalho voluntário na causa animal?"
            required
          >
            <select
              id="experiencia"
              name="experiencia"
              defaultValue={data?.experiencia ?? ""}
              aria-invalid={Boolean(fieldErrors.experiencia)}
              aria-describedby={fieldErrors.experiencia ? "experiencia-error" : undefined}
              className={clsx(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                fieldErrors.experiencia &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            >
              <option value="">Selecione</option>
              {EXPERIENCIA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormError id="experiencia-error" message={fieldErrors.experiencia} />
          </FormField>

          <FormField id="atuacao" label="Forma de Atuação" required>
            <select
              id="atuacao"
              name="atuacao"
              defaultValue={data?.atuacao ?? ""}
              aria-invalid={Boolean(fieldErrors.atuacao)}
              aria-describedby={fieldErrors.atuacao ? "atuacao-error" : undefined}
              className={clsx(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                fieldErrors.atuacao &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            >
              <option value="">Selecione</option>
              {ATUACAO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormError id="atuacao-error" message={fieldErrors.atuacao} />
          </FormField>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#4f5464]">Informações Adicionais</h2>

        <FormField
          id="descricao"
          label="Descreva habilidades em que você considera ter bom desempenho para ser voluntário em um abrigo"
          required
        >
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            defaultValue={data?.descricao ?? ""}
            aria-invalid={Boolean(fieldErrors.descricao)}
            aria-describedby={fieldErrors.descricao ? "descricao-error" : undefined}
            className={clsx(
              "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] placeholder:text-[#a0a6b1] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
              fieldErrors.descricao &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError id="descricao-error" message={fieldErrors.descricao} />
        </FormField>

        <FormField id="comentarios" label="Deixe mais comentários que queira compartilhar">
          <textarea
            id="comentarios"
            name="comentarios"
            rows={4}
            defaultValue={data?.comentarios ?? ""}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] placeholder:text-[#a0a6b1] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </FormField>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            defaultChecked={data?.acceptTerms ?? false}
            aria-invalid={Boolean(fieldErrors.acceptTerms)}
            aria-describedby={fieldErrors.acceptTerms ? "acceptTerms-error" : undefined}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
          <label htmlFor="acceptTerms" className="text-sm text-[#4f5464]">
            Declaro que estou de acordo com a{" "}
            <a
              href="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-primary hover:underline"
            >
              Política de Privacidade
            </a>{" "}
            e{" "}
            <a
              href="/termos-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-primary hover:underline"
            >
              Termo de Uso
            </a>{" "}
            <span className="text-brand-red">*</span>
          </label>
        </div>
        <FormError id="acceptTerms-error" message={fieldErrors.acceptTerms} />
      </div>

      <div className="flex flex-col items-center gap-4 pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-brand-primary px-10 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          disabled={isSubmitting || isLoading}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
