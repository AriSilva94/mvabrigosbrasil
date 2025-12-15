"use client";

import type { FormEvent, JSX } from "react";
import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";

import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FormError from "@/components/ui/FormError";
import { contactSchema, type ContactFormValues } from "@/modules/contact/contactSchema";

type ContactFormProps = {
  className?: string;
};

type FieldErrors = Partial<Record<keyof ContactFormValues, string>>;

export default function ContactForm({
  className,
}: ContactFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const values: ContactFormValues = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const issues: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          issues[path as keyof ContactFormValues] = issue.message;
        }
      });
      setFieldErrors(issues);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // Placeholder para integração futura (API ou serviço de e-mail).
      toast.success("Mensagem enviada! Em breve entraremos em contato.");
      event.currentTarget.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  const computedClass = "bg-[#f2f2f2]";

  return (
    <form
      className={clsx("space-y-4", className)}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="space-y-2 text-left">
        <label
          htmlFor="contact-name"
          className="text-sm font-semibold text-[#4f5464]"
        >
          Nome
        </label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Nome"
          required
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
          className={clsx(
            computedClass,
            fieldErrors.name &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="contact-name-error" message={fieldErrors.name} />
      </div>

      <div className="space-y-2 text-left">
        <label
          htmlFor="contact-email"
          className="text-sm font-semibold text-[#4f5464]"
        >
          E-mail
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="E-mail"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "contact-email-error" : undefined
          }
          className={clsx(
            computedClass,
            fieldErrors.email &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="contact-email-error" message={fieldErrors.email} />
      </div>

      <div className="space-y-2 text-left">
        <label
          htmlFor="contact-subject"
          className="text-sm font-semibold text-[#4f5464]"
        >
          Assunto
        </label>
        <Input
          id="contact-subject"
          name="subject"
          type="text"
          placeholder="Assunto"
          required
          aria-invalid={Boolean(fieldErrors.subject)}
          aria-describedby={
            fieldErrors.subject ? "contact-subject-error" : undefined
          }
          className={clsx(
            computedClass,
            fieldErrors.subject &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="contact-subject-error" message={fieldErrors.subject} />
      </div>

      <div className="space-y-2 text-left">
        <label
          htmlFor="contact-message"
          className="text-sm font-semibold text-[#4f5464]"
        >
          Mensagem
        </label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Mensagem"
          required
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={
            fieldErrors.message ? "contact-message-error" : undefined
          }
          className={clsx(
            computedClass,
            fieldErrors.message &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="contact-message-error" message={fieldErrors.message} />
      </div>

      <div className="pt-2 text-center">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-full bg-brand-primary px-8 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar Contato"}
        </button>
      </div>
    </form>
  );
}
