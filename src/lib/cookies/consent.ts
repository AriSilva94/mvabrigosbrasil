export const COOKIE_CONSENT_NAME = "cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;
/** Duração do cookie em segundos — 12 meses */
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  thirdPartyEmbeds: boolean;
};

export type CookieConsentValue = {
  v: number;
} & ConsentCategories;

export const DEFAULT_CONSENT: CookieConsentValue = {
  v: COOKIE_CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  thirdPartyEmbeds: false,
};

export const ACCEPT_ALL_CONSENT: CookieConsentValue = {
  v: COOKIE_CONSENT_VERSION,
  necessary: true,
  analytics: true,
  marketing: true,
  thirdPartyEmbeds: true,
};

export function parseConsent(raw: string | undefined): CookieConsentValue | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsentValue;
    if (parsed.v !== COOKIE_CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializeConsent(consent: CookieConsentValue): string {
  return JSON.stringify(consent);
}

export function hasConsent(category: keyof ConsentCategories, raw: string | undefined): boolean {
  const consent = parseConsent(raw);
  if (!consent) return category === "necessary";
  return consent[category];
}
