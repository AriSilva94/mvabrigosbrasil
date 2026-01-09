"use client";

import type { FormEvent, JSX } from "react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter } from "next/navigation";

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
import { PhoneInput } from "@/components/ui/PhoneInput";
import { TextOnlyInput } from "@/components/ui/TextOnlyInput";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { useLocationData } from "@/hooks/useLocationData";

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
  const router = useRouter();
  const { volunteer, isLoading, refresh } = useVolunteerProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof VolunteerProfileInput, string>>
  >({});

  // Estados e cidades
  const { estados, cidades, loadingEstados, loadingCidades, fetchCidades } = useLocationData();
  const [telefone, setTelefone] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");

  // Outros selects
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [genero, setGenero] = useState("");
  const [escolaridade, setEscolaridade] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [atuacao, setAtuacao] = useState("");

  // Converte estados para formato do Combobox
  const estadosOptions: ComboboxOption[] = estados.map((e) => ({
    value: e.sigla,
    label: e.nome,
  }));

  // Converte cidades para formato do Combobox
  const cidadesOptions: ComboboxOption[] = cidades.map((c) => ({
    value: c.nome,
    label: c.nome,
  }));

  // Carrega cidades quando estado muda
  useEffect(() => {
    if (estado) {
      fetchCidades(estado);
      setCidade(""); // Limpa cidade ao mudar estado
    }
  }, [estado, fetchCidades]);

  // Inicializa valores quando voluntário carrega
  useEffect(() => {
    if (volunteer) {
      setTelefone(volunteer.telefone || "");
      setEstado(volunteer.estado || "");
      setCidade(volunteer.cidade || "");
      setFaixaEtaria(volunteer.faixa_etaria || "");
      setGenero(volunteer.genero || "");
      setEscolaridade(volunteer.escolaridade || "");
      setDisponibilidade(volunteer.disponibilidade || "");
      setPeriodo(volunteer.periodo || "");
      setExperiencia(volunteer.experiencia || "");
      setAtuacao(volunteer.atuacao || "");

      // Carrega cidades do estado inicial
      if (volunteer.estado) {
        fetchCidades(volunteer.estado);
      }
    }
  }, [volunteer, fetchCidades]);

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
      router.push("/painel");
      router.refresh(); // força o Router Cache a descartar dados antigos antes da próxima navegação
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
            <PhoneInput
              id="telefone"
              name="telefone"
              value={telefone}
              onChange={setTelefone}
              autoComplete="tel"
              placeholder="(00) 00000-0000"
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
            <TextOnlyInput
              id="profissao"
              name="profissao"
              defaultValue={data?.profissao ?? ""}
              placeholder="Ex: Veterinário"
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
            <SelectDropdown
              name="faixa_etaria"
              options={FAIXA_ETARIA_OPTIONS}
              value={faixaEtaria}
              onChange={setFaixaEtaria}
              placeholder="Selecione a faixa etária"
              className={clsx(
                fieldErrors.faixa_etaria &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="faixa_etaria-error" message={fieldErrors.faixa_etaria} />
          </FormField>

          <FormField id="genero" label="Gênero" required>
            <SelectDropdown
              name="genero"
              options={GENERO_OPTIONS}
              value={genero}
              onChange={setGenero}
              placeholder="Selecione o gênero"
              className={clsx(
                fieldErrors.genero &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="genero-error" message={fieldErrors.genero} />
          </FormField>

          <FormField id="escolaridade" label="Escolaridade" required>
            <SelectDropdown
              name="escolaridade"
              options={ESCOLARIDADE_OPTIONS}
              value={escolaridade}
              onChange={setEscolaridade}
              placeholder="Selecione a escolaridade"
              className={clsx(
                fieldErrors.escolaridade &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="escolaridade-error" message={fieldErrors.escolaridade} />
          </FormField>

          <FormField id="estado" label="Estado" required>
            <Combobox
              name="estado"
              options={estadosOptions}
              value={estado}
              onChange={setEstado}
              placeholder="Selecione um estado"
              loading={loadingEstados}
              className={clsx(
                fieldErrors.estado &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="estado-error" message={fieldErrors.estado} />
          </FormField>

          <FormField id="cidade" label="Cidade" required>
            <Combobox
              name="cidade"
              options={cidadesOptions}
              value={cidade}
              onChange={setCidade}
              placeholder={estado ? "Selecione uma cidade" : "Selecione um estado primeiro"}
              loading={loadingCidades}
              disabled={!estado}
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
            <SelectDropdown
              name="disponibilidade"
              options={DISPONIBILIDADE_OPTIONS}
              value={disponibilidade}
              onChange={setDisponibilidade}
              placeholder="Selecione a disponibilidade"
              className={clsx(
                fieldErrors.disponibilidade &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="disponibilidade-error" message={fieldErrors.disponibilidade} />
          </FormField>

          <FormField
            id="periodo"
            label="Disponibilidade de período para trabalho voluntário"
            required
          >
            <SelectDropdown
              name="periodo"
              options={PERIODO_OPTIONS}
              value={periodo}
              onChange={setPeriodo}
              placeholder="Selecione o período"
              className={clsx(
                fieldErrors.periodo &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="periodo-error" message={fieldErrors.periodo} />
          </FormField>

          <FormField
            id="experiencia"
            label="Tem/teve experiência com trabalho voluntário na causa animal?"
            required
          >
            <SelectDropdown
              name="experiencia"
              options={EXPERIENCIA_OPTIONS}
              value={experiencia}
              onChange={setExperiencia}
              placeholder="Selecione"
              className={clsx(
                fieldErrors.experiencia &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            <FormError id="experiencia-error" message={fieldErrors.experiencia} />
          </FormField>

          <FormField id="atuacao" label="Forma de Atuação" required>
            <SelectDropdown
              name="atuacao"
              options={ATUACAO_OPTIONS}
              value={atuacao}
              onChange={setAtuacao}
              placeholder="Selecione a forma de atuação"
              className={clsx(
                fieldErrors.atuacao &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
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
