import type { JSX } from "react";

import ButtonLink from "@/components/ui/ButtonLink";
import { Heading } from "@/components/ui/typography";

export default function WhoWeAreSupportersCtaSection(): JSX.Element {
  return (
    <section className="bg-white py-16 text-center">
      <div className="container px-6">
        <Heading as="h2" className="font-24 text-brand-primary">
          Gostou? Venha fazer parte e ajudar a nossa causa!
        </Heading>
        <ButtonLink
          href="https://mvabrigosbrasil.com.br/parceiros"
          className="mt-6 inline-flex"
        >
          Seja um Apoiador
        </ButtonLink>
      </div>
    </section>
  );
}
