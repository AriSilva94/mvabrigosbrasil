import type { JSX } from "react";

import { Heading, Text } from "@/components/ui/typography";

type ContactInfoProps = {
  email: string;
};

export default function ContactInfo({ email }: ContactInfoProps): JSX.Element {
  return (
    <div className="space-y-3 text-[#4f5464]">
      <Heading as="h2" className="text-2xl font-semibold text-brand-primary">
        Fale com a equipe
      </Heading>
      <Text className="leading-relaxed">
        Se você tiver alguma dúvida sobre Medicina de Abrigos Brasil – Infodados
        de Abrigos de Animais, entre em contato!
      </Text>
      <Text className="leading-relaxed">
        <span className="font-semibold">E-mail: </span>
        <a
          href={`mailto:${email}`}
          className="text-brand-primary underline-offset-4 transition hover:text-brand-primary/80 hover:underline"
        >
          {email}
        </a>
      </Text>
      <Text className="leading-relaxed">
        Ou mande mensagem diretamente por aqui que em breve nossa equipe te
        responderá.
      </Text>
    </div>
  );
}
