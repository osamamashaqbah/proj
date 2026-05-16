import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { ComplianceRiskBadge, GuaranteedBadge, StatusBadge } from "@/components/ui/Badge";
import { BuyForm } from "./BuyForm";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const t = getT();
  const locale = getLocale();
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { category: true, seller: true },
  });
  if (!listing) notFound();

  const guaranteePackages = await prisma.guaranteePackage.findMany({
    where: { isActive: true },
    orderBy: { feePercent: "asc" },
  });
  const paymentMethods = await prisma.paymentMethodSetting.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  const labels: Record<string, string> = {
    PENDING: t("badges.pending"),
    APPROVED: t("badges.approved"),
    REJECTED: t("badges.rejected"),
    SOLD: t("badges.sold"),
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="card">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-bg-elevated mb-3 border border-neon-violet/30">
            {listing.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-silver-muted text-5xl">🎮</div>
            )}
          </div>
          {listing.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.slice(1, 5).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} className="h-16 w-full object-cover rounded border border-neon-violet/20" alt="" />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={listing.status} labels={labels} />
          <GuaranteedBadge label={t("product.guaranteedBadge")} />
          {listing.category.riskWarning && (
            <ComplianceRiskBadge label={t("badges.highRisk")} />
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-silver-bright">{listing.title}</h1>
        <div className="text-3xl font-display font-bold bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
          {formatPrice(listing.priceCents, listing.currency, locale)}
        </div>
        <div className="text-sm muted">
          {t("product.category")}:{" "}
          <span className="text-silver-bright">
            {locale === "ar" ? listing.category.nameAr : listing.category.nameEn}
          </span>
          {" · "}
          {t("product.seller")}: <span className="text-silver-bright">{listing.seller.name ?? listing.seller.email}</span>
        </div>
        {listing.category.riskWarning && (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3 text-yellow-200 text-sm">
            ⚠ {t("product.complianceWarning")}
          </div>
        )}
        <div className="card whitespace-pre-wrap text-silver">
          <h2 className="text-silver-bright font-medium mb-2">{t("product.details")}</h2>
          {listing.description}
        </div>

        {listing.status === "APPROVED" ? (
          <BuyForm
            listingId={listing.id}
            priceCents={listing.priceCents}
            currency={listing.currency}
            packages={guaranteePackages.map((p) => ({
              id: p.id,
              tier: p.tier,
              nameEn: p.nameEn,
              nameAr: p.nameAr,
              feePercent: p.feePercent,
              minFeeCents: p.minFeeCents,
            }))}
            paymentMethods={paymentMethods.map((m) => ({
              key: m.key,
              labelEn: m.labelEn,
              labelAr: m.labelAr,
            }))}
            t={{
              buyDirect: t("product.buyDirect"),
              buyWithGuarantee: t("product.buyWithGuarantee"),
              selectGuarantee: t("product.selectGuarantee"),
              paymentMethod: t("product.paymentMethod"),
              feeLabel: t("guarantee.feeLabel"),
              subtotal: t("orders.subtotal"),
              guaranteeFee: t("orders.guaranteeFee"),
              total: t("orders.total"),
              submit: t("marketplace.buyNow"),
              redirecting: t("payments.checkoutPending"),
              none: t("common.no"),
            }}
            locale={locale}
          />
        ) : (
          <div className="card muted">{labels[listing.status]}</div>
        )}
      </div>
    </div>
  );
}
