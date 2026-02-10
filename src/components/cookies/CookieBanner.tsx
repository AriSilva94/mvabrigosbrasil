"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import CookiePreferencesModal from "./CookiePreferencesModal";
import {
  ACCEPT_ALL_CONSENT,
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_VERSION,
  DEFAULT_CONSENT,
  parseConsent,
  type ConsentCategories,
  type CookieConsentValue,
} from "@/lib/cookies/consent";

async function saveConsent(consent: CookieConsentValue) {
  await fetch("/api/cookie-consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consent),
  });
}

function getCookieValue(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function dispatchConsentChange(consent: CookieConsentValue) {
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: consent }));
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof document === "undefined") return false;
    return parseConsent(getCookieValue(COOKIE_CONSENT_NAME)) === null;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<ConsentCategories>(() => {
    if (typeof document === "undefined") return DEFAULT_CONSENT;
    return parseConsent(getCookieValue(COOKIE_CONSENT_NAME)) ?? DEFAULT_CONSENT;
  });

  // Despachar consentimento existente para ConditionalAnalytics no mount
  useEffect(() => {
    const raw = getCookieValue(COOKIE_CONSENT_NAME);
    const consent = parseConsent(raw);
    if (consent) {
      dispatchConsentChange({ ...consent });
    }
  }, []);

  const handleAcceptAll = useCallback(async () => {
    await saveConsent(ACCEPT_ALL_CONSENT);
    setCurrentConsent(ACCEPT_ALL_CONSENT);
    dispatchConsentChange(ACCEPT_ALL_CONSENT);
    setVisible(false);
  }, []);

  const handleReject = useCallback(async () => {
    await saveConsent(DEFAULT_CONSENT);
    setCurrentConsent(DEFAULT_CONSENT);
    dispatchConsentChange(DEFAULT_CONSENT);
    setVisible(false);
  }, []);

  const handleSavePreferences = useCallback(async (categories: ConsentCategories) => {
    const consent: CookieConsentValue = { v: COOKIE_CONSENT_VERSION, ...categories };
    await saveConsent(consent);
    setCurrentConsent(consent);
    dispatchConsentChange(consent);
    setVisible(false);
  }, []);

  // Ouvir evento para reabrir o modal (footer / página de política)
  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("open-cookie-preferences", handler);
    return () => window.removeEventListener("open-cookie-preferences", handler);
  }, []);

  if (!visible && !modalOpen) return null;

  return (
    <>
      {visible && (
        <div
          role="dialog"
          aria-label="Consentimento de cookies"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] sm:p-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-text-default">
              Utilizamos cookies para melhorar sua experiência. Apenas os cookies necessários são carregados por padrão.
              Você pode personalizar suas preferências ou consultar nossa{" "}
              <a
                href="/politica-de-cookies"
                className="font-semibold text-brand-primary underline underline-offset-2 hover:text-brand-secondary"
              >
                Política de Cookies
              </a>
              .
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" onClick={handleReject} className="text-xs sm:text-sm">
                Rejeitar
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(true)} className="text-xs sm:text-sm">
                Personalizar
              </Button>
              <Button variant="primary" onClick={handleAcceptAll} className="text-xs sm:text-sm">
                Aceitar tudo
              </Button>
            </div>
          </div>
        </div>
      )}

      <CookiePreferencesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={currentConsent}
        onSave={handleSavePreferences}
      />
    </>
  );
}
