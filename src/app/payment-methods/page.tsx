import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const t = getT();
  const locale = getLocale();
  const methods = await prisma.paymentMethodSetting.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="section-title">{t("payments.title")}</h1>
        <p className="muted text-sm mt-1">{t("payments.subtitle")}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {methods.map((m) => (
          <div key={m.key} className="card">
            <div className="flex items-center justify-between">
              <div className="text-silver-bright font-medium">
                {locale === "ar" ? m.labelAr : m.labelEn}
              </div>
              <span className={m.enabled ? "badge-success" : "badge-danger"}>
                {m.enabled ? t("common.enabled") : t("common.disabled")}
              </span>
            </div>
            {m.description && <p className="muted text-sm mt-2">{m.description}</p>}
          </div>
        ))}
      </div>

      <section className="card">
        <h2 className="text-silver-bright font-medium mb-2">{t("payments.statusTitle")}</h2>
        <p className="muted text-sm">{t("payments.statusBody")}</p>
      </section>
      <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-4 text-yellow-200 text-sm">
        ⚠ {t("payments.disclaimer")}
      </div>
      <p className="muted text-xs">{t("payments.adminToggleHint")}</p>
    </div>
  );
}
