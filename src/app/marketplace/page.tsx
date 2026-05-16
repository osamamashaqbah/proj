import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { ListingCard } from "@/components/ui/ListingCard";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const t = getT();
  const locale = getLocale();

  const categories = await prisma.category.findMany({
    where: { enabled: true },
    orderBy: { nameEn: "asc" },
  });

  const where: any = { status: "APPROVED" };
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { description: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.category) {
    const cat = categories.find((c) => c.slug === searchParams.category);
    if (cat) where.categoryId = cat.id;
  }
  const listings = await prisma.listing.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const badgeLabels = {
    official: t("badges.official"),
    guaranteed: t("badges.guaranteed"),
    highRisk: t("badges.highRisk"),
    PENDING: t("badges.pending"),
    APPROVED: t("badges.approved"),
    REJECTED: t("badges.rejected"),
    SOLD: t("badges.sold"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="section-title">{t("marketplace.title")}</h1>
          <p className="muted text-sm mt-1">{t("home.heroSubtitle")}</p>
        </div>
        <form className="flex gap-2 flex-wrap">
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder={t("common.searchPlaceholder")}
            className="input min-w-[220px]"
          />
          <select
            name="category"
            defaultValue={searchParams.category ?? ""}
            className="input min-w-[180px]"
          >
            <option value="">{t("marketplace.filterAll")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
          <button className="btn-primary" type="submit">
            {t("common.search")}
          </button>
          {(searchParams.q || searchParams.category) && (
            <Link href="/marketplace" className="btn-ghost">
              {t("common.cancel")}
            </Link>
          )}
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {listings.map((l) => (
          <ListingCard
            key={l.id}
            href={`/product/${l.id}`}
            title={l.title}
            priceCents={l.priceCents}
            currency={l.currency}
            imageUrl={l.images?.[0]}
            categoryLabel={locale === "ar" ? l.category.nameAr : l.category.nameEn}
            showRisk={l.category.riskWarning}
            badgeLabels={badgeLabels}
            locale={locale}
          />
        ))}
        {listings.length === 0 && (
          <div className="muted col-span-full">{t("marketplace.noResults")}</div>
        )}
      </div>
    </div>
  );
}
