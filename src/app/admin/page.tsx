import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const t = getT();
  const [users, listings, pending, orders, gReqs, store, tickets] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.guaranteeRequest.count(),
    prisma.officialStoreProduct.count(),
    prisma.supportTicket.count(),
  ]);
  const stats = [
    { label: t("dashboard.admin.users"), value: users },
    { label: t("dashboard.admin.listings"), value: listings },
    { label: t("badges.pending"), value: pending },
    { label: t("dashboard.admin.orders"), value: orders },
    { label: t("dashboard.admin.guaranteeRequests"), value: gReqs },
    { label: t("dashboard.admin.store"), value: store },
    { label: "Tickets", value: tickets },
  ];
  return (
    <div className="space-y-6">
      <h1 className="section-title">{t("dashboard.admin.stats")}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-silver-muted text-xs">{s.label}</div>
            <div className="text-2xl font-semibold text-purple-300">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
