import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { StoreProductRow } from "./StoreProductRow";
import { NewStoreProductForm } from "./NewStoreProductForm";

export const dynamic = "force-dynamic";

export default async function AdminStorePage() {
  const t = getT();
  const locale = getLocale();
  const [products, categories] = await Promise.all([
    prisma.officialStoreProduct.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ where: { enabled: true }, orderBy: { nameEn: "asc" } }),
  ]);
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.store")}</h1>
      <NewStoreProductForm
        categories={categories.map((c) => ({ id: c.id, name: locale === "ar" ? c.nameAr : c.nameEn }))}
      />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th><th>{t("product.category")}</th>
              <th>{t("common.price")}</th><th>Stock</th>
              <th>Active</th><th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <StoreProductRow key={p.id} p={{
                id: p.id,
                title: p.title,
                priceLabel: formatPrice(p.priceCents, p.currency, locale),
                stock: p.stock,
                isActive: p.isActive,
                categoryName: locale === "ar" ? p.category.nameAr : p.category.nameEn,
              }} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
