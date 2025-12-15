"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

import AppImage from "@/components/ui/AppImage";
import SocialIcon from "@/components/ui/SocialIcon";
import {
  INSTITUTIONAL_LINKS,
  MAIN_NAV_LINKS,
  TOP_NAV_LINKS,
} from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const [isInstitutionalOpen, setInstitutionalOpen] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const institutionalRef = useRef<HTMLLIElement | null>(null);
  const isDropdownVisible = isInstitutionalOpen;
  const pathname = usePathname();

  const isLinkActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/biblioteca" && pathname.startsWith("/clipping")) {
      return true;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isInstitutionalActive = INSTITUTIONAL_LINKS.some((link) =>
    isLinkActive(link.href)
  );

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
          <nav className="hidden items-center gap-2 lg:flex">
            {TOP_NAV_LINKS.map((item, index) => (
              <div key={item.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-brand-accent">•</span>}
                <Link
                  href={item.href}
                  className={`hover:text-brand-accent ${
                    isLinkActive(item.href) ? "text-brand-accent" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          <button
            type="button"
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary text-brand-primary lg:hidden"
            onClick={() => {
              setMobileOpen((prev) => !prev);
              setInstitutionalOpen(false);
            }}
          >
            {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="hidden items-center gap-3 text-brand-primary lg:flex">
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
        <div className="container flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:gap-6">
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
            <div className="flex items-center gap-3 lg:hidden">
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

          <nav className="flex w-full flex-1 flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <ul
              className={`flex flex-col gap-3 text-[15px] font-medium text-brand-primary lg:flex-row lg:items-center lg:gap-5 xl:gap-6 ${
                isMobileOpen ? "block" : "hidden lg:flex"
              }`}
            >
              {MAIN_NAV_LINKS.map((item) => {
                const isDropdown = item.hasDropdown;
                if (!isDropdown) {
                  const isActive = isLinkActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`whitespace-nowrap hover:text-brand-accent ${
                          isActive ? "text-brand-accent" : ""
                        }`}
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
                      className={`flex cursor-pointer items-center gap-1 whitespace-nowrap hover:text-brand-accent ${
                        isInstitutionalActive
                          ? "text-brand-accent"
                          : "text-brand-primary"
                      }`}
                      aria-haspopup="true"
                      aria-expanded={isInstitutionalOpen}
                      onClick={() => setInstitutionalOpen((prev) => !prev)}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={`origin-center transition-transform duration-300 ease-in-out ${
                          isInstitutionalOpen
                            ? "rotate-180 -translate-y-0.5"
                            : "translate-y-0"
                        }`}
                      />
                    </button>

                    <div
                      className={`absolute left-0 top-full z-30 mt-2 w-52 rounded-md border border-brand-primary bg-white shadow-lg transition-all duration-200 ease-in-out lg:mt-3 ${
                        isDropdownVisible
                          ? "translate-y-0 opacity-100 visible"
                          : "-translate-y-2 opacity-0 invisible"
                      }`}
                      aria-hidden={!isDropdownVisible}
                    >
                      <ul className="py-2 text-sm text-brand-primary">
                        {INSTITUTIONAL_LINKS.map((subItem) => {
                          const isSubActive = isLinkActive(subItem.href);
                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className={`block px-4 py-2 transition ${
                                  isSubActive
                                    ? "bg-brand-primary text-white"
                                    : "hover:bg-brand-primary hover:text-white"
                                }`}
                                onClick={() => setInstitutionalOpen(false)}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-3">
              {!isLoading && user ? (
                <div className="relative">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary">
                      Área Restrita
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-200 group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <div className="absolute right-0 z-30 mt-2 w-40 rounded-md border border-brand-primary bg-white text-sm shadow-lg">
                      <Link
                        href="/painel"
                        className="block px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-white"
                        onClick={(e) => {
                          const detailsEl = e.currentTarget.closest(
                            "details"
                          ) as HTMLDetailsElement | null;
                          if (detailsEl) detailsEl.open = false;
                        }}
                      >
                        Painel
                      </Link>
                      <Link
                        href="/alterar-senha"
                        className="block px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-white"
                        onClick={(e) => {
                          const detailsEl = e.currentTarget.closest(
                            "details"
                          ) as HTMLDetailsElement | null;
                          if (detailsEl) detailsEl.open = false;
                        }}
                      >
                        Alterar Senha
                      </Link>
                      <Link
                        href="/login"
                        onClick={async (e) => {
                          const detailsEl = e.currentTarget.closest(
                            "details"
                          ) as HTMLDetailsElement | null;
                          if (detailsEl) detailsEl.open = false;
                          await logout();
                        }}
                        className="block px-4 py-2 text-brand-primary hover:bg-brand-primary hover:text-white"
                      >
                        Sair
                      </Link>
                    </div>
                  </details>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary"
                >
                  Entrar/Cadastrar
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
