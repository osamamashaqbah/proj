import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, Locale, resolveKey } from "./config";

export function getLocale(): Locale {
  const c = cookies().get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (c && LOCALES.includes(c)) return c;
  return DEFAULT_LOCALE;
}

export function getDir(locale: Locale = getLocale()): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

// Server-side translator
export function getT(locale: Locale = getLocale()) {
  return (key: string, vars?: Record<string, string | number>) => {
    let s = resolveKey(locale, key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  };
}
