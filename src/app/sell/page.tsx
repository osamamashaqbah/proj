import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { SellForm } from "./SellForm";

export const dynamic = "force-dynamic";

export default async function SellPage() {
  const t = getT();
  const locale = getLocale();
  const categories = await prisma.category.findMany({
    where: { enabled: true },
    orderBy: { nameEn: "asc" },
  });
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="section-title">{t("sell.title")}</h1>
        <p className="muted text-sm mt-1">{t("sell.subtitle")}</p>
      </div>
      <SellForm
        categories={categories.map((c) => ({
          id: c.id,
          name: locale === "ar" ? c.nameAr : c.nameEn,
          riskWarning: c.riskWarning,
        }))}
        t={{
          title: t("sell.fields.title"),
          description: t("sell.fields.description"),
          category: t("sell.fields.category"),
          price: t("sell.fields.price"),
          images: t("sell.fields.images"),
          submit: t("sell.submit"),
          successTitle: t("sell.successTitle"),
          successBody: t("sell.successBody"),
          required: t("validation.required"),
          riskWarning: t("product.complianceWarning"),
          another: t("common.anotherListing"),
        }}
      />
    </div>
  );
}
