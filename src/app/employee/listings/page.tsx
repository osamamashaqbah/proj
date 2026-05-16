import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { ListingActions } from "./ListingActions";

export const dynamic = "force-dynamic";

export default async function EmployeeListingsPage() {
  const t = getT();
  const locale = getLocale();
  const listings = await prisma.listing.findMany({
    where: { status: "PENDING" },
    include: { category: true, seller: true },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="section-title">{t("dashboard.employee.pendingListings")}</h1>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.listings.headings.title")}</th>
              <th>{t("admin.listings.headings.seller")}</th>
              <th>{t("product.category")}</th>
              <th>{t("common.price")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}>
                <td>
                  <a href={`/product/${l.id}`} className="link">{l.title}</a>
                  {l.category.riskWarning && (
                    <div className="text-xs text-yellow-300">⚠ {t("badges.highRisk")}</div>
                  )}
                </td>
                <td>{l.seller.email}</td>
                <td>{locale === "ar" ? l.category.nameAr : l.category.nameEn}</td>
                <td>{formatPrice(l.priceCents, l.currency, locale)}</td>
                <td>
                  <ListingActions
                    id={l.id}
                    approveLabel={t("common.approve")}
                    rejectLabel={t("common.reject")}
                    reasonPrompt={t("common.rejectionReasonPrompt")}
                  />
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr><td colSpan={5} className="muted">—</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
