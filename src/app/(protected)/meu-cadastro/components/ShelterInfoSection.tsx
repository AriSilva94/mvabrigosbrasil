import type { JSX } from "react";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Heading } from "@/components/ui/typography";
import {
  ADDITIONAL_SPECIES,
  DEFAULT_SHELTER_PROFILE,
  SHELTER_TYPE_OPTIONS,
  SPECIES_OPTIONS,
  STATE_OPTIONS,
} from "@/constants/shelterProfile";
import { FormField } from "./FormField";
import ShelterTypeHelp from "./ShelterTypeHelp";

export default function ShelterInfoSection(): JSX.Element {
  const data = DEFAULT_SHELTER_PROFILE;

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

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="shelterType" label="Tipo de Abrigo" required>
          <Select
            id="shelterType"
            name="shelterType"
            defaultValue={data.shelterType}
          >
            {SHELTER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="cnpj" label="CNPJ" required>
          <Input
            id="cnpj"
            name="cnpj"
            defaultValue={data.cnpj}
            required
            inputMode="numeric"
          />
        </FormField>

        <FormField id="shelterName" label="Nome do Abrigo" required>
          <Input
            id="shelterName"
            name="shelterName"
            defaultValue={data.name}
            required
          />
        </FormField>

        <FormField id="cep" label="CEP" required hint="não será divulgado">
          <Input
            id="cep"
            name="cep"
            defaultValue={data.cep}
            required
            inputMode="numeric"
          />
        </FormField>

        <FormField id="street" label="Rua" required hint="não será divulgado">
          <Input
            id="street"
            name="street"
            defaultValue={data.street}
            required
          />
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
            defaultValue={data.number}
            required
            min={0}
          />
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
            defaultValue={data.district}
            required
          />
        </FormField>

        <FormField id="state" label="Estado" required>
          <Select id="state" name="state" defaultValue={data.state} required>
            {STATE_OPTIONS.map((state) => (
              <option key={state.code} value={state.code}>
                {state.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="city" label="Cidade" required>
          <Input id="city" name="city" defaultValue={data.city} required />
        </FormField>

        <FormField id="website" label="Website do Abrigo">
          <Input id="website" name="website" defaultValue={data.website} />
        </FormField>

        <FormField id="foundationDate" label="Fundação do abrigo" required>
          <Input
            id="foundationDate"
            name="foundationDate"
            defaultValue={data.foundationDate}
            required
          />
        </FormField>

        <FormField id="species" label="Espécies Abrigadas" required>
          <Select
            id="species"
            name="species"
            defaultValue={data.species}
            required
          >
            {SPECIES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
                  defaultChecked={data.additionalSpecies.includes(option.value)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
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
                className="h-4 w-4 border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              Sim
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="temporaryAgreement"
                value="nao"
                className="h-4 w-4 border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              Não
            </label>
          </div>
        </div>

        <FormField id="initialDogs" label="População inicial de cães" required>
          <Input
            id="initialDogs"
            name="initialDogs"
            type="number"
            min={0}
            defaultValue={data.initialDogs}
            required
          />
        </FormField>

        <FormField id="initialCats" label="População inicial de gatos" required>
          <Input
            id="initialCats"
            name="initialCats"
            type="number"
            min={0}
            defaultValue={data.initialCats}
            required
          />
        </FormField>
      </div>
    </section>
  );
}
