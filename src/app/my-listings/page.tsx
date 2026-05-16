import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { DeleteListingButton } from "./DeleteListingButton";

export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const t = getT();
  const locale = getLocale();
  const me = await getCurrentUser();
  if (!me) return null;
  const listings = await prisma.listing.findMany({
    where: { sellerId: me.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  const labels: Record<string, string> = {
    PENDING: t("badges.pending"),
    APPROVED: t("badges.approved"),
    REJECTED: t("badges.rejected"),
    SOLD: t("badges.sold"),
    REMOVED: t("badges.sold"),
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{t("myListings.title")}</h1>
        <Link href="/sell" className="btn-primary">{t("myListings.create")}</Link>
      </div>
      {listings.length === 0 && <div className="muted">{t("myListings.noListings")}</div>}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>{t("product.category")}</th>
              <th>{t("common.price")}</th>
              <th>{t("common.status")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}>
                <td><Link className="link" href={`/product/${l.id}`}>{l.title}</Link></td>
                <td>{locale === "ar" ? l.category.nameAr : l.category.nameEn}</td>
                <td>{formatPrice(l.priceCents, l.currency, locale)}</td>
                <td><StatusBadge status={l.status} labels={labels} /></td>
                <td className="flex gap-2">
                  <Link className="btn-ghost" href={`/my-listings/${l.id}/edit`}>{t("common.edit")}</Link>
                  <DeleteListingButton id={l.id} label={t("common.delete")} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
