import type { JSX } from "react";
import clsx from "clsx";

import RegisterField from "@/components/auth/RegisterField";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";

type RegisterPasswordFieldsProps = {
  errors?: Partial<Record<"password" | "confirmPassword", string>>;
};

export default function RegisterPasswordFields({
  errors = {},
}: RegisterPasswordFieldsProps): JSX.Element {
  return (
    <>
      <RegisterField id="password" label="Senha" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "register-password-error" : undefined
          }
          className={clsx(
            "bg-[#f2f2f2]",
            errors.password &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="register-password-error" message={errors.password} />
      </RegisterField>

      <RegisterField id="confirmPassword" label="Confirmar senha" required>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword
              ? "register-confirm-password-error"
              : undefined
          }
          className={clsx(
            "bg-[#f2f2f2]",
            errors.confirmPassword &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError
          id="register-confirm-password-error"
          message={errors.confirmPassword}
        />
      </RegisterField>
    </>
  );
}
