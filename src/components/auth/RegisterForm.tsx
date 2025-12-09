"use client";

import type { JSX } from "react";
import { useMemo } from "react";
import clsx from "clsx";

import RegisterActionLinks from "@/components/auth/RegisterActionLinks";
import RegisterField from "@/components/auth/RegisterField";
import RegisterPasswordFields from "@/components/auth/RegisterPasswordFields";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import { Heading, Text } from "@/components/ui/typography";
import { REGISTER_CONTENT } from "@/constants/register";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import type { RegisterType } from "@/types/auth.types";

type RegisterFormProps = {
  registerType: RegisterType;
  className?: string;
};

export default function RegisterForm({
  registerType,
  className,
}: RegisterFormProps): JSX.Element {
  const { fieldErrors, isRegistering, handleSubmit } =
    useRegisterForm(registerType);

  const registerContent = useMemo(
    () => REGISTER_CONTENT[registerType],
    [registerType]
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={clsx("w-full max-w-md space-y-6 p-2 text-left", className)}
    >
      <header className="space-y-1 text-center">
        <Heading as="h3" className="text-[22px] font-semibold text-[#555a6d]">
          {registerContent.title}
        </Heading>
      </header>

      <RegisterField id="email" label="E-mail" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "register-email-error" : undefined
          }
          className={clsx(
            "bg-[#f2f2f2]",
            fieldErrors.email &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="register-email-error" message={fieldErrors.email} />
      </RegisterField>

      <RegisterPasswordFields
        errors={{
          password: fieldErrors.password,
          confirmPassword: fieldErrors.confirmPassword,
        }}
      />

      <div className="pt-2 text-center">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-full bg-brand-primary px-8 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isRegistering}
        >
          {isRegistering ? "Enviando..." : "Cadastrar"}
        </button>
      </div>

      <RegisterActionLinks />

      <Text className="text-center text-xs text-[#9ba1ad]">
        Ao clicar em &quot;Cadastrar&quot; voce concorda com os Termos de Uso e
        a Politica de Privacidade.
      </Text>
    </form>
  );
}
