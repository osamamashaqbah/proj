import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { ListingCard } from "@/components/ui/ListingCard";

export const dynamic = "force-dynamic";

export default async function OfficialStorePage() {
  const t = getT();
  const locale = getLocale();
  const products = await prisma.officialStoreProduct.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  const labels = {
    official: t("badges.official"),
    guaranteed: t("badges.guaranteed"),
    highRisk: t("badges.highRisk"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">{t("officialStore.title")}</h1>
        <p className="muted text-sm mt-1">{t("officialStore.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ListingCard
            key={p.id}
            href={`/official-store/${p.id}`}
            title={p.title}
            priceCents={p.priceCents}
            currency={p.currency}
            imageUrl={p.images?.[0]}
            categoryLabel={locale === "ar" ? p.category.nameAr : p.category.nameEn}
            showOfficial
            badgeLabels={labels}
            locale={locale}
          />
        ))}
        {products.length === 0 && <div className="muted col-span-full">—</div>}
      </div>
    </div>
  );
}
