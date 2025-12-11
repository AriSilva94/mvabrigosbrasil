import type { JSX } from "react";
import Link from "next/link";

import Input from "@/components/ui/Input";
import MaskedInput from "@/components/ui/MaskedInput";
import Select from "@/components/ui/Select";
import FormError from "@/components/ui/FormError";
import { Heading, Text } from "@/components/ui/typography";
import { ROLES_OPTIONS } from "@/constants/shelterProfile";
import clsx from "clsx";
import type { ShelterProfileFormData } from "@/types/shelter.types";
import { FormField } from "./FormField";

type ShelterAuthorizationSectionProps = {
  data?: Partial<ShelterProfileFormData> | null;
  fieldErrors?: Partial<Record<string, string>>;
};

export default function ShelterAuthorizationSection({
  data,
  fieldErrors,
}: ShelterAuthorizationSectionProps): JSX.Element {
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
            defaultValue={data?.authorizedName}
            required
            aria-invalid={Boolean(fieldErrors?.authorizedName)}
            aria-describedby={fieldErrors?.authorizedName ? "authorizedName-error" : undefined}
            className={clsx(
              "bg-[#f2f2f2]",
              fieldErrors?.authorizedName &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15",
            )}
          />
          <FormError id="authorizedName-error" message={fieldErrors?.authorizedName} />
        </FormField>

        <FormField id="authorizedRole" label="Cargo" required>
          <Select
            id="authorizedRole"
            name="authorizedRole"
            defaultValue={data?.authorizedRole}
            required
            aria-invalid={Boolean(fieldErrors?.authorizedRole)}
            aria-describedby={fieldErrors?.authorizedRole ? "authorizedRole-error" : undefined}
            className={clsx(
              fieldErrors?.authorizedRole &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15",
            )}
          >
            <option value="">Selecione</option>
            {ROLES_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
          <FormError id="authorizedRole-error" message={fieldErrors?.authorizedRole} />
        </FormField>

        <FormField id="authorizedEmail" label="E-mail" required>
          <Input
            id="authorizedEmail"
            name="authorizedEmail"
            type="email"
            defaultValue={data?.authorizedEmail}
            required
            aria-invalid={Boolean(fieldErrors?.authorizedEmail)}
            aria-describedby={fieldErrors?.authorizedEmail ? "authorizedEmail-error" : undefined}
            className={clsx(
              "bg-[#f2f2f2]",
              fieldErrors?.authorizedEmail &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15",
            )}
          />
          <FormError id="authorizedEmail-error" message={fieldErrors?.authorizedEmail} />
        </FormField>

        <FormField id="authorizedPhone" label="Telefone" required>
          <MaskedInput
            id="authorizedPhone"
            name="authorizedPhone"
            mask="phone"
            defaultValue={data?.authorizedPhone}
            required
            aria-invalid={Boolean(fieldErrors?.authorizedPhone)}
            aria-describedby={fieldErrors?.authorizedPhone ? "authorizedPhone-error" : undefined}
            className={clsx(
              "bg-[#f2f2f2]",
              fieldErrors?.authorizedPhone &&
                "border-brand-red focus:border-brand-red focus:ring-brand-red/15",
            )}
          />
          <FormError id="authorizedPhone-error" message={fieldErrors?.authorizedPhone} />
        </FormField>
      </div>

      <div className="mt-2 space-y-2 text-sm text-[#6b7280]">
        <label
          className={clsx(
            "inline-flex items-center gap-2 font-semibold text-[#4f5464]",
            fieldErrors?.acceptTerms && "text-brand-red",
          )}
        >
          <input
            type="checkbox"
            name="acceptTerms"
            defaultChecked={data?.acceptTerms ?? false}
            className={clsx(
              "h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary",
              fieldErrors?.acceptTerms &&
                "border-brand-red text-brand-red focus:border-brand-red focus:ring-brand-red/15",
            )}
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
        <FormError id="acceptTerms-error" message={fieldErrors?.acceptTerms} />
      </div>
    </section>
  );
}
