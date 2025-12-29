"use client";

import type { JSX } from "react";
import { useState } from "react";

import Input from "@/components/ui/Input";
import MaskedInput from "@/components/ui/MaskedInput";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import { Heading } from "@/components/ui/typography";
import {
  ADDITIONAL_SPECIES,
  SHELTER_TYPE_OPTIONS,
  SPECIES_OPTIONS,
  STATE_OPTIONS,
} from "@/constants/shelterProfile";
import FormError from "@/components/ui/FormError";
import { useCepAutocomplete } from "@/hooks/useCepAutocomplete";
import clsx from "clsx";
import type { ShelterProfileFormData } from "@/types/shelter.types";
import { FormField } from "./FormField";
import ShelterTypeHelp from "./ShelterTypeHelp";

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
  const disabledStyles = lockNonPopulation
    ? "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
    : "";

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onShelterTypeChange?.(event.target.value);
    onDocumentValueChange?.("");
  };

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (!value || value.replace(/\D/g, "").length !== 8) return;

    const result = await searchCep(value);
    if (result && onCepAutocomplete) {
      onCepAutocomplete({
        street: result.logradouro,
        district: result.bairro,
        city: result.localidade,
        state: result.uf,
      });
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
                  : undefined
              }
              className={clsx(
                "bg-[#f2f2f2]",
                disabledStyles,
                (fieldErrors?.cep || cepError) &&
                  "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
              )}
            />
            {isCepLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner />
              </div>
            )}
          </div>
          <FormError id="cep-error" message={fieldErrors?.cep} />
          {cepError && !fieldErrors?.cep && (
            <FormError id="cep-viacep-error" message={cepError} />
          )}
        </FormField>

        <FormField id="street" label="Rua" required hint="não será divulgado">
          <Input
            id="street"
            name="street"
            defaultValue={data?.street}
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
            defaultValue={data?.district}
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
          <Select
            id="state"
            name="state"
            defaultValue={data?.state}
            disabled={lockNonPopulation}
            required
            aria-invalid={Boolean(fieldErrors?.state)}
            aria-describedby={fieldErrors?.state ? "state-error" : undefined}
            className={clsx(
              disabledStyles,
              fieldErrors?.state &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
            )}
          >
            {STATE_OPTIONS.map((state) => (
              <option key={state.code} value={state.code}>
                {state.label}
              </option>
            ))}
          </Select>
          <FormError id="state-error" message={fieldErrors?.state} />
        </FormField>

        <FormField id="city" label="Cidade" required>
          <Input
            id="city"
            name="city"
            defaultValue={data?.city}
            required
            disabled={lockNonPopulation}
            aria-invalid={Boolean(fieldErrors?.city)}
            aria-describedby={fieldErrors?.city ? "city-error" : undefined}
            className={clsx(
              "bg-[#f2f2f2]",
              disabledStyles,
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
          <Input
            id="foundationDate"
            name="foundationDate"
            type="date"
            defaultValue={data?.foundationDate ?? ""}
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
