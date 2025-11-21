import Link from "next/link";

import AppImage from "@/components/ui/AppImage";
import SocialIcon from "@/components/ui/SocialIcon";

const SOCIAL_LINKS = [
  {
    href: "https://facebook.com/mvabrigosbrasil",
    label: "mvabrigosbrasil",
    name: "facebook" as const,
  },
  {
    href: "https://instagram.com/mvabrigosbrasil",
    label: "mvabrigosbrasil",
    name: "instagram" as const,
  },
];

const POLICY_LINKS = [
  {
    label: "Compromisso",
    href: "https://mvabrigosbrasil.com.br/compromisso-privacidade",
  },
  {
    label: "Política de Privacidade",
    href: "https://mvabrigosbrasil.com.br/politica-de-privacidade",
  },
  {
    label: "Política de Cookies",
    href: "https://mvabrigosbrasil.com.br/politica-de-cookies",
  },
  {
    label: "Termos de Uso",
    href: "https://mvabrigosbrasil.com.br/termos-de-uso",
  },
  { label: "Contato", href: "https://mvabrigosbrasil.com.br/contato" },
];

export default function Footer() {
  return (
    <footer className="bg-light text-brand-primary">
      <div className="border-t border-brand-primary/15">
        <div className="container px-6 py-10">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-10">
            {SOCIAL_LINKS.map(({ href, label, name }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${label} no ${name}`}
                className="inline-flex items-center gap-3 text-lg font-semibold text-brand-primary transition-colors duration-150 hover:text-brand-accent"
              >
                <SocialIcon
                  name={name}
                  size={26}
                  className="text-brand-accent"
                  aria-hidden
                />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-brand-primary text-white">
        <div className="container px-6 py-12 text-center">
          <Link href="/" className="inline-flex justify-center">
            <AppImage
              src="/assets/img/logo-medicina-de-abrigos-brasil.svg"
              alt="Medicina de Abrigos Brasil"
              width={260}
              height={120}
              className="h-16 w-auto brightness-0 invert"
              priority
            />
          </Link>

          <nav aria-label="Links institucionais">
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-white md:gap-5 md:text-base">
              {POLICY_LINKS.map(({ label, href }, index) => (
                <li key={href} className="flex items-center gap-3">
                  {index > 0 && (
                    <span className="text-white/50" aria-hidden>
                      •
                    </span>
                  )}
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-brand-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 border-t border-white/25 pt-4 text-xs text-white/80">
            <p>
              2022 © Medicina de Abrigos Brasil - Infodados de Abrigos de
              Animais. Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>

      <div className="h-1.5 w-full bg-brand-primary" aria-hidden />
    </footer>
  );
}
