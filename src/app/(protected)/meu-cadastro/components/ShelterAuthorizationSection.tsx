import type { JSX } from "react";
import Link from "next/link";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Heading, Text } from "@/components/ui/typography";
import {
  DEFAULT_SHELTER_PROFILE,
  ROLES_OPTIONS,
} from "@/constants/shelterProfile";
import { FormField } from "./FormField";

export default function ShelterAuthorizationSection(): JSX.Element {
  const data = DEFAULT_SHELTER_PROFILE;

  return (
    <section aria-labelledby="authorization-heading" className="space-y-6">
      <Heading
        id="authorization-heading"
        as="h2"
        className="text-[22px] font-semibold text-[#555a6d]"
      >
        Autorização
      </Heading>

      <div className="space-y-3 text-[#6b7280]">
        <Text className="text-sm leading-relaxed">
          O gestor ou uma pessoa autorizada pelo abrigo (funcionário ou voluntário)
          deve concordar com a participação em nosso banco de dados nacional.
        </Text>
        <Text className="text-sm leading-relaxed">
          Os dados devem ser registrados uma vez no mês, ou seja, registrar a quantidade
          de animais que entram, que são devolvidos, que são eutanasiados, que morrem
          por causa natural e que são adotados.*
        </Text>
        <Text className="text-sm leading-relaxed">
          *após o cadastro haverá um campo que você(s) poderá(ão) controlar essa dinâmica
          populacional e também extrair essas informações para controle interno da
          organização. Sua contribuição é de fundamental importância.
        </Text>
      </div>

      <div className="space-y-2">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f5464]">
          <input
            type="checkbox"
            name="authorizedPerson"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
          />
          Eu sou a pessoa autorizada
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="authorizedName" label="Nome social completo" required>
          <Input
            id="authorizedName"
            name="authorizedName"
            defaultValue={data.authorizedName}
            required
          />
        </FormField>

        <FormField id="authorizedRole" label="Cargo" required>
          <Select
            id="authorizedRole"
            name="authorizedRole"
            defaultValue={data.authorizedRole}
            required
          >
            <option value="">Selecione</option>
            {ROLES_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="authorizedEmail" label="E-mail" required>
          <Input
            id="authorizedEmail"
            name="authorizedEmail"
            type="email"
            defaultValue={data.authorizedEmail}
            required
          />
        </FormField>

        <FormField id="authorizedPhone" label="Telefone" required>
          <Input
            id="authorizedPhone"
            name="authorizedPhone"
            defaultValue={data.authorizedPhone}
            required
          />
        </FormField>
      </div>

      <div className="mt-2 space-y-2 text-sm text-[#6b7280]">
        <label className="inline-flex items-center gap-2 font-semibold text-[#4f5464]">
          <input
            type="checkbox"
            name="acceptTerms"
            defaultChecked={data.acceptTerms}
            disabled
            className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
          />
          Declaro que estou de acordo com a{" "}
          <Link
            href="/politica-de-privacidade"
            className="text-brand-primary underline-offset-2 hover:underline"
          >
            Política de Privacidade
          </Link>{" "}
          e{" "}
          <Link
            href="/termos-de-uso"
            className="text-brand-primary underline-offset-2 hover:underline"
          >
            Termo de Uso
          </Link>
          <span className="text-brand-red">*</span>
        </label>
      </div>
    </section>
  );
}
