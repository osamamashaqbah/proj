import Link from "next/link";
import { getT } from "@/i18n/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboard() {
  const t = getT();
  const [pending, tickets, gReqs] = await Promise.all([
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.guaranteeRequest.count({ where: { status: { in: ["REQUESTED", "AWAITING_FUNDS", "HELD_IN_ESCROW", "DISPUTED"] } } }),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="section-title">{t("dashboard.employee.title")}</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/employee/listings" className="card card-hover">
          <div className="text-silver-muted text-xs uppercase tracking-wider">{t("dashboard.employee.pendingListings")}</div>
          <div className="text-3xl font-display font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">{pending}</div>
        </Link>
        <Link href="/employee/tickets" className="card card-hover">
          <div className="text-silver-muted text-xs uppercase tracking-wider">{t("dashboard.employee.tickets")}</div>
          <div className="text-3xl font-display font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">{tickets}</div>
        </Link>
        <Link href="/employee/guarantees" className="card card-hover">
          <div className="text-silver-muted text-xs uppercase tracking-wider">{t("dashboard.employee.guaranteeRequests")}</div>
          <div className="text-3xl font-display font-bold mt-1 bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">{gReqs}</div>
        </Link>
      </div>
    </div>
  );
}
