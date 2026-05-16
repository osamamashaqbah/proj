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

  const formLabels = {
    title: t("admin.store.form.title"),
    price: t("admin.store.form.price"),
    stock: t("admin.store.form.stock"),
    description: t("admin.store.form.description"),
    images: t("admin.store.form.images"),
    submit: t("admin.store.form.submit"),
  };
  const rowLabels = {
    active: t("common.active"),
    inactive: t("common.inactive"),
    delete: t("common.delete"),
    deleteConfirm: t("common.deleteConfirm"),
  };

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.store")}</h1>
      <NewStoreProductForm
        categories={categories.map((c) => ({ id: c.id, name: locale === "ar" ? c.nameAr : c.nameEn }))}
        labels={formLabels}
      />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.store.headings.title")}</th>
              <th>{t("product.category")}</th>
              <th>{t("common.price")}</th>
              <th>{t("admin.store.headings.stock")}</th>
              <th>{t("admin.store.headings.active")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <StoreProductRow
                key={p.id}
                p={{
                  id: p.id,
                  title: p.title,
                  priceLabel: formatPrice(p.priceCents, p.currency, locale),
                  stock: p.stock,
                  isActive: p.isActive,
                  categoryName: locale === "ar" ? p.category.nameAr : p.category.nameEn,
                }}
                labels={rowLabels}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
