"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Menu, X, ChevronDown, MessageCircle } from "lucide-react";

import AppImage from "@/components/ui/AppImage";
import SocialIcon from "@/components/ui/SocialIcon";

const topNavLinks = [
  { href: "/", label: "Inicial" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/contato", label: "Contato" },
];

const institutionalLinks = [
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/equipe-mv", label: "Equipe" },
  { href: "/medicina-de-abrigos", label: "Medicina de Abrigos" },
  { href: "/parceiros", label: "Parceiros" },
];

const mainNavLinks = [
  { href: "/quem-somos", label: "Institucional", hasDropdown: true },
  { href: "/banco-de-dados", label: "Banco de Dados" },
  { href: "/programa-de-voluntarios", label: "Voluntários" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/materias", label: "Matérias" },
  { href: "/relatorios", label: "Relatórios" },
];

export default function Header() {
  const [isInstitutionalOpen, setInstitutionalOpen] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const institutionalRef = useRef<HTMLLIElement | null>(null);
  const isDropdownVisible = isInstitutionalOpen || isMobileOpen;

  useEffect(() => {
    if (!isInstitutionalOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        institutionalRef.current &&
        !institutionalRef.current.contains(event.target as Node)
      ) {
        setInstitutionalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isInstitutionalOpen]);

  return (
    <header className="relative z-20 w-full border-b border-slate-200">
      <div className="bg-white text-sm text-brand-primary">
        <div className="container flex items-center justify-between px-4 py-2">
          <nav className="hidden items-center gap-2 md:flex">
            {topNavLinks.map((item, index) => (
              <div key={item.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-brand-accent">•</span>}
                <Link href={item.href} className="hover:text-brand-accent">
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          <button
            type="button"
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary text-brand-primary md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="hidden items-center gap-3 text-brand-primary md:flex">
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className="hover:text-brand-accent"
              target="_blank"
              rel="noreferrer"
            >
              <SocialIcon name="facebook" />
            </a>
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="hover:text-brand-accent"
              target="_blank"
              rel="noreferrer"
            >
              <SocialIcon name="instagram" />
            </a>
            <a
              href="https://wa.me/"
              aria-label="WhatsApp"
              className="hover:text-brand-accent"
              target="_blank"
              rel="noreferrer"
            >
              <SocialIcon name="whatsapp" />
            </a>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-slate-200" />

      <div className="bg-white">
        <div className="container flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <AppImage
                src="/assets/img/logo-medicina-de-abrigos-brasil.svg"
                alt="Medicina de Abrigos Brasil"
                width={252}
                height={85}
                className="h-12 w-auto md:h-20"
              />
            </Link>
            <div className="flex items-center gap-3 md:hidden">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="text-brand-primary"
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon name="facebook" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="text-brand-primary"
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon name="instagram" />
              </a>
              <a
                href="https://wa.me/"
                aria-label="WhatsApp"
                className="text-brand-primary"
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon name="whatsapp" />
              </a>
            </div>
          </div>

          <nav className="flex w-full flex-1 flex-col items-start gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
            <ul
              className={`flex flex-col gap-3 text-[15px] font-medium text-brand-primary md:flex-row md:items-center md:gap-4 ${
                isMobileOpen ? "block" : "hidden md:flex"
              }`}
            >
              {mainNavLinks.map((item) => {
                const isDropdown = item.hasDropdown;
                if (!isDropdown) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="hover:text-brand-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li
                    key={item.href}
                    ref={institutionalRef}
                    className="relative"
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1 text-brand-accent hover:text-brand-accent cursor-pointer"
                      aria-haspopup="true"
                      aria-expanded={isInstitutionalOpen}
                      onClick={() => setInstitutionalOpen((prev) => !prev)}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={`origin-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                          isInstitutionalOpen
                            ? "rotate-180 -translate-y-0.5"
                            : "translate-y-0"
                        }`}
                      />
                    </button>

                    <div
                      className={`absolute left-0 top-full z-30 mt-2 w-52 rounded-md border border-brand-primary bg-white shadow-lg transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] md:mt-3 ${
                        isDropdownVisible
                          ? "translate-y-0 opacity-100 visible"
                          : "-translate-y-2 opacity-0 invisible"
                      }`}
                      aria-hidden={!isDropdownVisible}
                    >
                      <ul className="py-2 text-sm text-brand-primary">
                        {institutionalLinks.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className="block px-4 py-2 hover:bg-brand-primary hover:text-white"
                              onClick={() => setInstitutionalOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary"
              >
                Entrar/Cadastrar
              </Link>
              <Link
                href="/buscar"
                aria-label="Buscar"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white hover:bg-brand-secondary"
              >
                <Search size={18} />
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
