import Link from "next/link";
import { getT } from "@/i18n/server";

export function Footer() {
  const t = getT();
  return (
    <footer className="mt-16 border-t border-neon-violet/30 bg-bg-soft/80 backdrop-blur-md">
      <div className="h-[2px] w-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink opacity-60 shadow-[0_0_8px_#a855f7]" />
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-sm text-silver">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕹️</span>
            <span className="neon-title text-2xl">
              {t("common.appName")}
            </span>
          </div>
          <p className="muted mt-3 leading-relaxed">{t("common.tagline")}</p>
        </div>
        <div>
          <div className="text-neon-pink font-semibold mb-3 uppercase tracking-wider text-xs">
            {t("nav.marketplace")}
          </div>
          <ul className="space-y-2">
            <li><Link className="link" href="/marketplace">{t("nav.marketplace")}</Link></li>
            <li><Link className="link" href="/categories">{t("nav.categories")}</Link></li>
            <li><Link className="link" href="/official-store">{t("nav.officialStore")}</Link></li>
            <li><Link className="link" href="/sell">{t("nav.sell")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-neon-cyan font-semibold mb-3 uppercase tracking-wider text-xs">
            {t("nav.support")}
          </div>
          <ul className="space-y-2">
            <li><Link className="link" href="/support">{t("nav.support")}</Link></li>
            <li><Link className="link" href="/contact">{t("footer.contact")}</Link></li>
            <li><Link className="link" href="/guarantee">{t("nav.guarantee")}</Link></li>
            <li><Link className="link" href="/payment-methods">{t("nav.paymentMethods")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-neon-violet font-semibold mb-3 uppercase tracking-wider text-xs">
            {t("nav.terms")}
          </div>
          <ul className="space-y-2">
            <li><Link className="link" href="/terms">{t("nav.terms")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neon-violet/20 py-4 text-center text-xs muted">
        © {new Date().getFullYear()} {t("common.appName")} · {t("footer.rights")}
      </div>
    </footer>
  );
}
