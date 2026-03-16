import type { JSX } from "react";

import { Heading } from "@/components/ui/typography";

type ProfileFieldProps = {
  label: string;
  value?: string | number | null;
  fallback?: string;
};

export default function ProfileField({
  label,
  value,
  fallback = "Não informado",
}: ProfileFieldProps): JSX.Element {
  return (
    <div>
      <Heading as="h3" className="text-base font-semibold text-brand-primary">
        {label}
      </Heading>
      <p className="mt-1 text-base text-[#68707b]">{value || fallback}</p>
    </div>
  );
}
