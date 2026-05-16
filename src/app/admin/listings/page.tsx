import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { ListingActions } from "@/app/employee/listings/ListingActions";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage({ searchParams }: { searchParams: { status?: string } }) {
  const t = getT();
  const locale = getLocale();
  const where: any = {};
  if (searchParams.status) where.status = searchParams.status;
  const listings = await prisma.listing.findMany({
    where,
    include: { category: true, seller: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{t("dashboard.admin.listings")}</h1>
        <form className="flex gap-2">
          <select name="status" defaultValue={searchParams.status ?? ""} className="input">
            <option value="">{t("common.all")}</option>
            {["PENDING", "APPROVED", "REJECTED", "SOLD", "REMOVED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn-secondary">Filter</button>
        </form>
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th><th>Seller</th><th>{t("product.category")}</th>
              <th>{t("common.price")}</th><th>{t("common.status")}</th><th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}>
                <td><a href={`/product/${l.id}`} className="link">{l.title}</a></td>
                <td>{l.seller.email}</td>
                <td>{locale === "ar" ? l.category.nameAr : l.category.nameEn}</td>
                <td>{formatPrice(l.priceCents, l.currency, locale)}</td>
                <td><span className="badge-silver">{l.status}</span></td>
                <td>
                  {l.status === "PENDING"
                    ? <ListingActions id={l.id} approveLabel={t("common.approve")} rejectLabel={t("common.reject")} />
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
