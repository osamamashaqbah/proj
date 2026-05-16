"use client";

import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <SessionProvider>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </SessionProvider>
  );
}
