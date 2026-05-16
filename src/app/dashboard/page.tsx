import Link from "next/link";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UserDashboard() {
  const t = getT();
  const me = await getCurrentUser();
  if (!me) return null;

  const [listings, orders, tickets] = await Promise.all([
    prisma.listing.count({ where: { sellerId: me.id } }),
    prisma.order.count({ where: { buyerId: me.id } }),
    prisma.supportTicket.count({ where: { authorId: me.id } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="section-title">{t("dashboard.user.title")}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/my-listings" className="card card-hover">
          <div className="text-silver-muted text-xs uppercase tracking-wider">{t("dashboard.user.myListings")}</div>
          <div className="text-3xl font-display font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">{listings}</div>
        </Link>
        <Link href="/orders" className="card card-hover">
          <div className="text-silver-muted text-xs uppercase tracking-wider">{t("dashboard.user.myOrders")}</div>
          <div className="text-3xl font-display font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">{orders}</div>
        </Link>
        <Link href="/support" className="card card-hover">
          <div className="text-silver-muted text-xs uppercase tracking-wider">{t("support.myTickets")}</div>
          <div className="text-3xl font-display font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">{tickets}</div>
        </Link>
        <Link href="/profile" className="card card-hover">
          <div className="text-silver-muted text-xs uppercase tracking-wider">{t("dashboard.user.myProfile")}</div>
          <div className="text-sm muted mt-2 truncate">{me.email}</div>
        </Link>
      </div>
      <div>
        <Link href="/sell" className="btn-primary">+ {t("dashboard.user.newListing")}</Link>
      </div>
    </div>
  );
}
