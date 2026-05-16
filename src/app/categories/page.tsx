import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const t = getT();
  const locale = getLocale();
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">{t("categories.title")}</h1>
        <p className="muted text-sm mt-1">{t("categories.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-silver-bright">
                  {locale === "ar" ? c.nameAr : c.nameEn}
                </div>
                <div className="text-xs muted mt-1">/{c.slug}</div>
              </div>
              <span className={c.enabled ? "badge-success" : "badge-danger"}>
                {c.enabled ? t("common.enabled") : t("common.disabled")}
              </span>
            </div>
            {c.riskWarning && (
              <div className="mt-2 text-xs text-yellow-300">
                ⚠ {t("badges.highRisk")}
              </div>
            )}
            <div className="mt-3">
              {c.enabled ? (
                <Link href={`/marketplace?category=${c.slug}`} className="link">
                  {t("nav.marketplace")} →
                </Link>
              ) : (
                <span className="text-xs muted">{t("categories.disabledNotice")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
