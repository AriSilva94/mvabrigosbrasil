import type { JSX } from "react";

type FormErrorProps = {
  id?: string;
  message?: string;
};

export default function FormError({ id, message }: FormErrorProps): JSX.Element | null {
  if (!message) return null;

  return (
    <p
      id={id}
      className="text-sm font-medium text-brand-red"
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  );
}
