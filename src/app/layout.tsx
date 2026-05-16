import "./globals.css";
import type { Metadata } from "next";
import { getLocale, getDir, getT } from "@/i18n/server";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";

export const metadata: Metadata = {
  title: "GameVault - Used games & gaming services marketplace",
  description:
    "Dark-themed marketplace for used video games, gaming accounts, subscriptions, digital items and gaming services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  const dir = getDir(locale);
  const t = getT(locale);

  return (
    <html lang={locale} dir={dir} className="dark">
      <body className="min-h-screen flex flex-col">
        <Providers locale={locale}>
          <Navbar />
          <ComplianceBanner message={t("home.complianceWarning")} />
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 md:py-10">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
