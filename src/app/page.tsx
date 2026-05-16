import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { ListingCard } from "@/components/ui/ListingCard";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, string> = {
  USED_GAMES: "💿",
  ACCOUNTS: "🎮",
  SUBSCRIPTIONS: "🎟️",
  DIGITAL_ITEMS: "💎",
  SERVICES: "⚔️",
  OTHER: "🕹️",
};

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
    <div className="space-y-14">
      {/* Hero */}
      <section className="arcade-frame">
        <div className="relative overflow-hidden p-6 md:p-12">
          {/* glowing decorations */}
          <div className="absolute -top-20 -end-20 h-64 w-64 rounded-full bg-neon-pink/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-neon-cyan/20 blur-3xl pointer-events-none" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 text-xs font-mono text-neon-cyan uppercase tracking-widest">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon-pink animate-pulse" />
                {t("home.heroBadge")}
              </div>
              <h1 className="neon-title text-4xl md:text-6xl leading-tight animate-pulse-neon">
                {t("home.heroTitle")}
              </h1>
              <p className="mt-4 text-silver leading-relaxed text-base md:text-lg max-w-xl">
                {t("home.heroSubtitle")}
              </p>
              <div className="mt-8 flex gap-3 flex-wrap">
                <Link href="/marketplace" className="btn-primary">
                  ▶ {t("home.ctaBrowse")}
                </Link>
                <Link href="/sell" className="btn-secondary">
                  + {t("home.ctaSell")}
                </Link>
              </div>
            </div>
            <div className="hidden md:flex flex-col gap-3">
              <div className="card-arcade">
                <div className="flex items-center gap-2 text-neon-cyan text-xs uppercase tracking-widest font-mono mb-2">
                  <span className="text-base">🛡️</span> {t("home.guaranteeTitle")}
                </div>
                <div className="text-xl font-semibold text-silver-bright leading-snug">
                  {t("home.guaranteeSubtitle")}
                </div>
                <Link href="/guarantee" className="link mt-3 inline-block text-sm">
                  {t("nav.guarantee")} →
                </Link>
              </div>
              <div className="card-arcade">
                <div className="flex items-center gap-2 text-neon-pink text-xs uppercase tracking-widest font-mono mb-2">
                  <span className="text-base">⭐</span> {t("home.officialStoreTitle")}
                </div>
                <div className="text-xl font-semibold text-silver-bright leading-snug">
                  {t("home.officialStoreSubtitle")}
                </div>
                <Link href="/official-store" className="link mt-3 inline-block text-sm">
                  {t("nav.officialStore")} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <span className="text-neon-pink">▌</span>
            {t("home.featuredCategories")}
          </h2>
          <Link href="/categories" className="link text-sm">
            {t("nav.categories")} →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/marketplace?category=${c.slug}`}
              className="card card-hover text-center group"
            >
              <div className="text-3xl mb-2 transition group-hover:scale-110">
                {CATEGORY_ICONS[c.kind] ?? "🎮"}
              </div>
              <div className="text-silver-bright font-semibold leading-tight">
                {locale === "ar" ? c.nameAr : c.nameEn}
              </div>
              {c.riskWarning && (
                <div className="mt-1.5 text-[10px] text-yellow-300 uppercase tracking-wider">
                  {t("badges.highRisk")}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <span className="text-neon-cyan">▌</span>
            {t("home.featuredListings")}
          </h2>
          <Link href="/marketplace" className="link text-sm">
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <span className="text-neon-pink">▌</span>
            {t("home.officialStoreTitle")}
          </h2>
          <Link href="/official-store" className="link text-sm">
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
