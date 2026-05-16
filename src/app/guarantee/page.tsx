import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GuaranteePage() {
  const t = getT();
  const locale = getLocale();
  const packages = await prisma.guaranteePackage.findMany({
    where: { isActive: true },
    orderBy: { feePercent: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">{t("guarantee.title")}</h1>
        <p className="muted text-sm mt-1">{t("guarantee.subtitle")}</p>
      </div>

      <section className="card">
        <h2 className="text-silver-bright font-medium mb-2">{t("guarantee.howItWorks")}</h2>
        <p className="muted text-sm whitespace-pre-line">{t("guarantee.howItWorksBody")}</p>
      </section>

      <div className="grid md:grid-cols-3 gap-4">
        {packages.map((p) => (
          <div key={p.id} className="card flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-silver-bright font-semibold text-lg">
                {locale === "ar" ? p.nameAr : p.nameEn}
              </div>
              <span className="badge-purple">
                {t(`guarantee.tiers.${p.tier}`)}
              </span>
            </div>
            <div className="mt-2 text-purple-300 text-2xl font-bold">{p.feePercent}%</div>
            <div className="text-xs muted">{t("guarantee.feeLabel")}</div>
            <ul className="mt-4 space-y-1 text-sm">
              {p.features.map((f, i) => (
                <li key={i} className="text-silver">• {f}</li>
              ))}
            </ul>
            <div className="mt-auto pt-4">
              <Link href="/marketplace" className="btn-primary w-full">
                {t("guarantee.selectPackage")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
