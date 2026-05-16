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
    { label: t("dashboard.admin.stats_total_users"), value: users },
    { label: t("dashboard.admin.stats_total_listings"), value: listings },
    { label: t("dashboard.admin.stats_pending"), value: pending },
    { label: t("dashboard.admin.stats_orders"), value: orders },
    { label: t("dashboard.admin.stats_guarantee_requests"), value: gReqs },
    { label: t("dashboard.admin.stats_store_products"), value: store },
    { label: t("dashboard.admin.stats_tickets"), value: tickets },
  ];
  return (
    <div className="space-y-6">
      <h1 className="section-title">{t("dashboard.admin.stats")}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-silver-muted text-xs uppercase tracking-wider">{s.label}</div>
            <div className="text-3xl font-display font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
