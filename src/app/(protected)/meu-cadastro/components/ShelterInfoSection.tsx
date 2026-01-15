"use client";

import type { JSX } from "react";
import { useState, useEffect } from "react";

import Input from "@/components/ui/Input";
import MaskedInput from "@/components/ui/MaskedInput";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import { Heading } from "@/components/ui/typography";
import {
  ADDITIONAL_SPECIES,
  SHELTER_TYPE_OPTIONS,
  SPECIES_OPTIONS,
} from "@/constants/shelterProfile";
import FormError from "@/components/ui/FormError";
import { useCepAutocomplete } from "@/hooks/useCepAutocomplete";
import clsx from "clsx";
import type { ShelterProfileFormData } from "@/types/shelter.types";
import { FormField } from "./FormField";
import ShelterTypeHelp from "./ShelterTypeHelp";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";
import { useLocationData } from "@/hooks/useLocationData";
import { useAddressCheck } from "@/hooks/useAddressCheck";
import { DatePicker } from "@/components/ui/DatePicker";
import { AlertTriangle } from "lucide-react";

type ShelterInfoSectionProps = {
  data?: Partial<ShelterProfileFormData> | null;
  fieldErrors?: Partial<Record<string, string>>;
  shelterType?: string;
  documentValue?: string;
  onShelterTypeChange?: (value: string) => void;
  onDocumentValueChange?: (value: string) => void;
  onCepAutocomplete?: (data: {
    street: string;
    district: string;
    city: string;
    state: string;
  }) => void;
  onDuplicateCepChange?: (hasDuplicate: boolean) => void;
  lockNonPopulation?: boolean;
};

export default function ShelterInfoSection({
  data,
  fieldErrors,
  shelterType,
  documentValue,
  onShelterTypeChange,
  onDocumentValueChange,
  onCepAutocomplete,
  onDuplicateCepChange,
  lockNonPopulation = false,
}: ShelterInfoSectionProps): JSX.Element {
  const documentLabel = shelterType === "temporary" ? "CPF" : "CNPJ";
  const documentMask = shelterType === "temporary" ? "cpf" : "cnpj";

  const [cepValue, setCepValue] = useState(data?.cep ?? "");
  const {
    isLoading: isCepLoading,
    error: cepError,
    searchCep,
    clearError,
  } = useCepAutocomplete();
  const {
    isLoading: isCheckingAddress,
    checkAddress,
    clearError: clearAddressError,
  } = useAddressCheck();
  const [addressWarning, setAddressWarning] = useState<string | null>(null);
  const disabledStyles = lockNonPopulation
    ? "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
    : "";

  // Estados e cidades
  const { estados, cidades, loadingEstados, loadingCidades, fetchCidades } = useLocationData();
  const [estado, setEstado] = useState(data?.state ?? "");
  const [cidade, setCidade] = useState(data?.city ?? "");
  const [fundacao, setFundacao] = useState(data?.foundationDate ?? "");
  const [rua, setRua] = useState(data?.street ?? "");
  const [bairro, setBairro] = useState(data?.district ?? "");

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
      // Não limpa cidade aqui porque pode ser autocomplete do CEP
    }
  }, [estado, fetchCidades]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onShelterTypeChange?.(event.target.value);
    onDocumentValueChange?.("");
  };

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (!value || value.replace(/\D/g, "").length !== 8) return;

    // Limpa avisos anteriores
    setAddressWarning(null);
    clearAddressError();

    // Busca endereço pelo CEP
    const result = await searchCep(value);
    if (result && onCepAutocomplete) {
      onCepAutocomplete({
        street: result.logradouro,
        district: result.bairro,
        city: result.localidade,
        state: result.uf,
      });
      // Atualiza todos os campos localmente
      setRua(result.logradouro);
      setBairro(result.bairro);
      setEstado(result.uf);
      setCidade(result.localidade);

      // Verifica se já existe abrigo com mesmo CEP
      const addressCheck = await checkAddress(value);
      if (addressCheck?.exists && addressCheck.count > 0) {
        const shelterNames = addressCheck.shelters.map((s) => s.name).join(', ');
        setAddressWarning(
          `Atenção: Já ${addressCheck.count === 1 ? 'existe 1 abrigo cadastrado' : `existem ${addressCheck.count} abrigos cadastrados`} neste CEP: ${shelterNames}. Verifique se não é duplicidade.`
        );
        onDuplicateCepChange?.(true);
      } else {
        onDuplicateCepChange?.(false);
      }
    }
  }

  return (
    <section aria-labelledby="shelter-info-heading" className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Heading
            id="shelter-info-heading"
            as="h2"
            className="text-[22px] font-semibold text-[#555a6d]"
          >
            Informações do Abrigo
          </Heading>
        </div>
        <div className="w-full max-w-xl">
          <ShelterTypeHelp />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2" id="populacao-inicial">
        <FormField id="shelterType" label="Tipo de Abrigo" required>
          <Select
            id="shelterType"
            name="shelterType"
            value={shelterType}
            onChange={handleTypeChange}
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.shelterType)}
            aria-describedby={
              fieldErrors?.shelterType ? "shelterType-error" : undefined
            }
            className={clsx(
              disabledStyles,
              fieldErrors?.shelterType &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          >
            {SHELTER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FormError
            id="shelterType-error"
            message={fieldErrors?.shelterType}
          />
        </FormField>

        <FormField id="cnpj" label={documentLabel} required>
          <MaskedInput
            id="cnpj"
            name="cnpj"
            mask={documentMask}
            value={documentValue}
            onValueChange={(_, masked) => onDocumentValueChange?.(masked)}
            disabled={lockNonPopulation}
            required
            aria-invalid={Boolean(fieldErrors?.cnpj)}
            aria-describedby={fieldErrors?.cnpj ? "cnpj-error" : undefined}
            className={clsx(
              "bg-[#f2f2f2]",
              disabledStyles,
              fieldErrors?.cnpj &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError id="cnpj-error" message={fieldErrors?.cnpj} />
        </FormField>

        <FormField id="shelterName" label="Nome do Abrigo" required>
          <Input
            id="shelterName"
            name="shelterName"
            defaultValue={data?.name}
            required
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.shelterName)}
            aria-describedby={
              fieldErrors?.shelterName ? "shelterName-error" : undefined
            }
            className={clsx(
              "bg-[#f2f2f2]",
              disabledStyles,
              fieldErrors?.shelterName &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError
            id="shelterName-error"
            message={fieldErrors?.shelterName}
          />
        </FormField>

        <FormField id="cep" label="CEP" required hint="não será divulgado">
          <div className="relative">
            <MaskedInput
              id="cep"
              name="cep"
              mask="cep"
              value={cepValue}
              onValueChange={(_, masked) => {
                setCepValue(masked);
                clearError();
                setAddressWarning(null);
                onDuplicateCepChange?.(false);
              }}
              onBlur={handleCepBlur}
              disabled={lockNonPopulation}
              required
              aria-invalid={Boolean(fieldErrors?.cep || cepError)}
              aria-describedby={
                fieldErrors?.cep
                  ? "cep-error"
                  : cepError
                  ? "cep-viacep-error"
                  : addressWarning
                  ? "cep-warning"
                  : undefined
              }
              className={clsx(
                "bg-[#f2f2f2]",
                disabledStyles,
                (fieldErrors?.cep || cepError) &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15",
                addressWarning &&
                  "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/15"
              )}
            />
            {(isCepLoading || isCheckingAddress) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner />
              </div>
            )}
          </div>
          <FormError id="cep-error" message={fieldErrors?.cep} />
          {cepError && !fieldErrors?.cep && (
            <FormError id="cep-viacep-error" message={cepError} />
          )}
          {addressWarning && !fieldErrors?.cep && !cepError && (
            <div id="cep-warning" className="mt-1 flex items-start gap-2 text-sm text-yellow-600">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{addressWarning}</span>
            </div>
          )}
        </FormField>

        <FormField id="street" label="Rua" required hint="não será divulgado">
          <Input
            id="street"
            name="street"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            required
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.street)}
            aria-describedby={fieldErrors?.street ? "street-error" : undefined}
            className={clsx(
              "bg-[#f2f2f2]",
              disabledStyles,
              fieldErrors?.street &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError id="street-error" message={fieldErrors?.street} />
        </FormField>

        <FormField
          id="number"
          label="Número"
          required
          hint="não será divulgado"
        >
          <Input
            id="number"
            name="number"
            type="number"
            defaultValue={data?.number}
            required
            min={0}
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.number)}
            aria-describedby={fieldErrors?.number ? "number-error" : undefined}
            className={clsx(
              "bg-[#f2f2f2]",
              disabledStyles,
              fieldErrors?.number &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError id="number-error" message={fieldErrors?.number} />
        </FormField>

        <FormField
          id="district"
          label="Bairro"
          required
          hint="não será divulgado"
        >
          <Input
            id="district"
            name="district"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            required
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.district)}
            aria-describedby={
              fieldErrors?.district ? "district-error" : undefined
            }
            className={clsx(
              "bg-[#f2f2f2]",
              disabledStyles,
              fieldErrors?.district &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError id="district-error" message={fieldErrors?.district} />
        </FormField>

        <FormField id="state" label="Estado" required>
          <Combobox
            name="state"
            options={estadosOptions}
            value={estado}
            onChange={setEstado}
            placeholder="Selecione um estado"
            loading={loadingEstados}
            disabled={lockNonPopulation}
            className={clsx(
              fieldErrors?.state &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError id="state-error" message={fieldErrors?.state} />
        </FormField>

        <FormField id="city" label="Cidade" required>
          <Combobox
            name="city"
            options={cidadesOptions}
            value={cidade}
            onChange={setCidade}
            placeholder={estado ? "Selecione uma cidade" : "Selecione um estado primeiro"}
            loading={loadingCidades}
            disabled={!estado || lockNonPopulation}
            className={clsx(
              fieldErrors?.city &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError id="city-error" message={fieldErrors?.city} />
        </FormField>

        <FormField id="website" label="Website do Abrigo">
          <Input
            id="website"
            name="website"
            defaultValue={data?.website}
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.website)}
            aria-describedby={
              fieldErrors?.website ? "website-error" : undefined
            }
            className={clsx(
              "bg-[#f2f2f2]",
              disabledStyles,
              fieldErrors?.website &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError id="website-error" message={fieldErrors?.website} />
        </FormField>

        <FormField id="foundationDate" label="Fundação do abrigo" required>
          <DatePicker
            id="foundationDate"
            name="foundationDate"
            value={fundacao}
            onChange={setFundacao}
            maxDate={new Date().toISOString().split('T')[0]}
            required
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.foundationDate)}
            aria-describedby={
              fieldErrors?.foundationDate ? "foundationDate-error" : undefined
            }
            className={clsx(
              "bg-[#f2f2f2]",
              disabledStyles,
              fieldErrors?.foundationDate &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError
            id="foundationDate-error"
            message={fieldErrors?.foundationDate}
          />
        </FormField>

        <FormField id="species" label="Espécies Abrigadas" required>
          <Select
            id="species"
            name="species"
            defaultValue={data?.species}
            required
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.species)}
            aria-describedby={
              fieldErrors?.species ? "species-error" : undefined
            }
            className={clsx(
              disabledStyles,
              fieldErrors?.species &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          >
            {SPECIES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FormError id="species-error" message={fieldErrors?.species} />
        </FormField>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-[#4f5464]">
            Outras espécies
          </span>
        <div className="grid grid-cols-2 gap-2 text-sm text-[#4f5464]">
          {ADDITIONAL_SPECIES.map((option) => (
            <label
              key={option.value}
              className="inline-flex items-center gap-2"
            >
              <input
                type="checkbox"
                name="additionalSpecies"
                value={option.value}
                defaultChecked={data?.additionalSpecies?.includes(
                  option.value
                )}
                disabled={lockNonPopulation}
                className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary disabled:cursor-not-allowed"
              />
              {option.label}
            </label>
          ))}
        </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-[#4f5464]">
            Possui convênio com lares temporários?
          </span>
          <div className="flex items-center gap-4 text-sm text-[#4f5464]">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="temporaryAgreement"
                value="sim"
                defaultChecked={data?.hasTemporaryAgreement === true}
                disabled={lockNonPopulation}
                className="h-4 w-4 border-slate-300 text-brand-primary focus:ring-brand-primary disabled:cursor-not-allowed"
              />
              Sim
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="temporaryAgreement"
                value="nao"
                defaultChecked={data?.hasTemporaryAgreement !== true}
                disabled={lockNonPopulation}
                className="h-4 w-4 border-slate-300 text-brand-primary focus:ring-brand-primary disabled:cursor-not-allowed"
              />
              Não
            </label>
          </div>
          <FormError
            id="temporaryAgreement-error"
            message={fieldErrors?.temporaryAgreement}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="initialDogs" label="População inicial de cães" required>
          <Input
            id="initialDogs"
            name="initialDogs"
            type="number"
            min={0}
            defaultValue={data?.initialDogs}
            required
            aria-invalid={Boolean(fieldErrors?.initialDogs)}
            aria-describedby={
              fieldErrors?.initialDogs ? "initialDogs-error" : undefined
            }
            className={clsx(
              "bg-[#f2f2f2]",
              fieldErrors?.initialDogs &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError
            id="initialDogs-error"
            message={fieldErrors?.initialDogs}
          />
        </FormField>

        <FormField id="initialCats" label="População inicial de gatos" required>
          <Input
            id="initialCats"
            name="initialCats"
            type="number"
            min={0}
            defaultValue={data?.initialCats}
            required
            aria-invalid={Boolean(fieldErrors?.initialCats)}
            aria-describedby={
              fieldErrors?.initialCats ? "initialCats-error" : undefined
            }
            className={clsx(
              "bg-[#f2f2f2]",
              fieldErrors?.initialCats &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          />
          <FormError
            id="initialCats-error"
            message={fieldErrors?.initialCats}
          />
        </FormField>
      </div>
    </section>
  );
}
