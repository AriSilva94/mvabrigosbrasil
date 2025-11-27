import Link from "next/link";

import AppImage from "@/components/ui/AppImage";
import SocialIcon from "@/components/ui/SocialIcon";
import {
  FOOTER_INSTAGRAM_POSTS,
  FOOTER_POLICY_LINKS,
  FOOTER_SOCIAL_LINKS,
} from "@/constants/footer";

export default function Footer() {
  return (
    <footer className="bg-light text-brand-primary">
      <section className="border-b border-brand-primary/10 bg-white">
        <div className="px-6 py-10">
          <div
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
            aria-labelledby="instagram-feed-heading"
          >
            {FOOTER_INSTAGRAM_POSTS.map(({ href, image, alt, type }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Abrir post do Instagram: ${alt}`}
                className="group relative block aspect-square overflow-hidden rounded-xl bg-brand-primary/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
              >
                <AppImage
                  src={image}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-brand-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                {type === "video" && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-brand-primary shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>
      <div className="border-t border-brand-primary/15">
        <div className="container px-6 py-10">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-10">
            {FOOTER_SOCIAL_LINKS.map(({ href, label, name }) => (
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
              {FOOTER_POLICY_LINKS.map(({ label, href }, index) => (
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
