import en from "./messages/en.json";
import ar from "./messages/ar.json";

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

export const messages: Record<Locale, any> = { en, ar };

export function isRTL(locale: Locale) {
  return locale === "ar";
}

// Resolve a dotted key like "nav.home" against a locale's message tree.
export function resolveKey(locale: Locale, key: string): string {
  const parts = key.split(".");
  let cur: any = messages[locale] ?? messages[DEFAULT_LOCALE];
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return key;
  }
  return typeof cur === "string" ? cur : key;
}
