import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { ListingCard } from "@/components/ui/ListingCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = getT();
  const locale = getLocale();

  const [categories, listings, storeProducts] = await Promise.all([
    prisma.category.findMany({ where: { enabled: true }, orderBy: { nameEn: "asc" } }),
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      include: { category: true, seller: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.officialStoreProduct.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const badgeLabels = {
    official: t("badges.official"),
    guaranteed: t("badges.guaranteed"),
    pending: t("badges.pending"),
    approved: t("badges.approved"),
    rejected: t("badges.rejected"),
    sold: t("badges.sold"),
    highRisk: t("badges.highRisk"),
    PENDING: t("badges.pending"),
    APPROVED: t("badges.approved"),
    REJECTED: t("badges.rejected"),
    SOLD: t("badges.sold"),
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="card overflow-hidden relative">
        <div className="absolute inset-0 bg-purple-gradient opacity-10 pointer-events-none" />
        <div className="relative grid md:grid-cols-2 gap-6 items-center p-2 md:p-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-silver-bright">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-3 muted">{t("home.heroSubtitle")}</p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link href="/marketplace" className="btn-primary">
                {t("home.ctaBrowse")}
              </Link>
              <Link href="/sell" className="btn-secondary">
                {t("home.ctaSell")}
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="rounded-xl border border-purple-700/40 bg-bg-soft p-6 shadow-glow">
              <div className="text-sm muted mb-2">{t("home.guaranteeTitle")}</div>
              <div className="text-2xl font-semibold text-silver-bright">
                {t("home.guaranteeSubtitle")}
              </div>
              <Link href="/guarantee" className="link mt-4 inline-block">
                {t("nav.guarantee")} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="section-title mb-4">{t("home.featuredCategories")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/marketplace?category=${c.slug}`}
              className="card card-hover text-center"
            >
              <div className="text-2xl mb-1">🎮</div>
              <div className="text-silver-bright font-medium">
                {locale === "ar" ? c.nameAr : c.nameEn}
              </div>
              {c.riskWarning && (
                <div className="mt-1 text-[10px] text-yellow-300">
                  {t("badges.highRisk")}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">{t("home.featuredListings")}</h2>
          <Link href="/marketplace" className="link">
            {t("nav.marketplace")} →
          </Link>
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
      </section>

      {/* Official store */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">{t("home.officialStoreTitle")}</h2>
          <Link href="/official-store" className="link">
            {t("nav.officialStore")} →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {storeProducts.map((p) => (
            <ListingCard
              key={p.id}
              href={`/official-store/${p.id}`}
              title={p.title}
              priceCents={p.priceCents}
              currency={p.currency}
              imageUrl={p.images?.[0]}
              categoryLabel={locale === "ar" ? p.category.nameAr : p.category.nameEn}
              showOfficial
              badgeLabels={badgeLabels}
              locale={locale}
            />
          ))}
          {storeProducts.length === 0 && (
            <div className="muted col-span-full">—</div>
          )}
        </div>
      </section>
    </div>
  );
}
