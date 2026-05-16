import Link from "next/link";
import { getT } from "@/i18n/server";

export function Footer() {
  const t = getT();
  return (
    <footer className="mt-12 border-t border-purple-800/30 bg-bg-soft/60">
      <div className="mx-auto max-w-7xl px-4 py-8 grid gap-6 md:grid-cols-4 text-sm text-silver">
        <div>
          <div className="font-semibold text-silver-bright bg-purple-gradient bg-clip-text">
            {t("common.appName")}
          </div>
          <p className="muted mt-2">{t("common.tagline")}</p>
        </div>
        <div>
          <div className="text-silver-bright font-medium mb-2">{t("nav.marketplace")}</div>
          <ul className="space-y-1">
            <li><Link className="link" href="/marketplace">{t("nav.marketplace")}</Link></li>
            <li><Link className="link" href="/categories">{t("nav.categories")}</Link></li>
            <li><Link className="link" href="/official-store">{t("nav.officialStore")}</Link></li>
            <li><Link className="link" href="/sell">{t("nav.sell")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-silver-bright font-medium mb-2">{t("nav.support")}</div>
          <ul className="space-y-1">
            <li><Link className="link" href="/contact">{t("nav.support")}</Link></li>
            <li><Link className="link" href="/guarantee">{t("nav.guarantee")}</Link></li>
            <li><Link className="link" href="/payment-methods">{t("nav.paymentMethods")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-silver-bright font-medium mb-2">{t("nav.terms")}</div>
          <ul className="space-y-1">
            <li><Link className="link" href="/terms">{t("nav.terms")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-purple-800/30 py-4 text-center text-xs muted">
        © {new Date().getFullYear()} {t("common.appName")}
      </div>
    </footer>
  );
}
