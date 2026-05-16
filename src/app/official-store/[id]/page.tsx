import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { OfficialBadge } from "@/components/ui/Badge";
import { OfficialBuyForm } from "./OfficialBuyForm";

export const dynamic = "force-dynamic";

export default async function StoreProductPage({ params }: { params: { id: string } }) {
  const t = getT();
  const locale = getLocale();
  const product = await prisma.officialStoreProduct.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!product) notFound();

  const methods = await prisma.paymentMethodSetting.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="card">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-bg-elevated">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🎮</div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <OfficialBadge label={t("product.officialBadge")} />
          <span className="badge-purple">{t("product.soldByPlatform")}</span>
        </div>
        <h1 className="text-3xl font-bold text-silver-bright">{product.title}</h1>
        <div className="text-purple-300 text-2xl font-semibold">
          {formatPrice(product.priceCents, product.currency, locale)}
        </div>
        <div className="text-sm muted">
          {t("product.category")}:{" "}
          <span className="text-silver-bright">
            {locale === "ar" ? product.category.nameAr : product.category.nameEn}
          </span>
        </div>
        <div className="card whitespace-pre-wrap text-silver">
          <h2 className="text-silver-bright font-medium mb-2">{t("product.details")}</h2>
          {product.description}
        </div>
        {product.stock > 0 ? (
          <OfficialBuyForm
            productId={product.id}
            paymentMethods={methods.map((m) => ({
              key: m.key,
              labelEn: m.labelEn,
              labelAr: m.labelAr,
            }))}
            locale={locale}
            label={t("marketplace.buyNow")}
          />
        ) : (
          <div className="card text-yellow-200">{t("officialStore.outOfStock")}</div>
        )}
      </div>
    </div>
  );
}
