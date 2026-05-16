import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function EmployeeTicketsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const t = getT();
  const where: any = {};
  if (searchParams.status) where.status = searchParams.status;

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { author: true, assignee: true, _count: { select: { messages: true } } },
    take: 100,
  });

  const statusLabels: Record<string, string> = {
    OPEN: t("support.ticketStatus.OPEN"),
    IN_PROGRESS: t("support.ticketStatus.IN_PROGRESS"),
    RESOLVED: t("support.ticketStatus.RESOLVED"),
    CLOSED: t("support.ticketStatus.CLOSED"),
  };
  const statusBadge: Record<string, string> = {
    OPEN: "badge-warning",
    IN_PROGRESS: "badge-cyan",
    RESOLVED: "badge-success",
    CLOSED: "badge-neutral",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="section-title">{t("dashboard.employee.tickets")}</h1>
        <form className="flex gap-2">
          <select name="status" defaultValue={searchParams.status ?? ""} className="input">
            <option value="">{t("common.all")}</option>
            {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
          <button className="btn-secondary">{t("common.filter")}</button>
        </form>
      </div>

      {tickets.length === 0 && <div className="muted">{t("support.noTickets")}</div>}

      <div className="space-y-2">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/employee/tickets/${ticket.id}`}
            className="card card-hover block"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-silver-bright truncate">{ticket.subject}</div>
                <div className="muted text-xs mt-1">
                  👤 {ticket.author.name ?? ticket.author.email}
                  {ticket.assignee && <> · 🛠 {ticket.assignee.email}</>}
                </div>
                <div className="muted text-xs mt-1 line-clamp-1">{ticket.body}</div>
                <div className="muted text-xs mt-2">
                  💬 {ticket._count.messages} ·{" "}
                  {new Date(ticket.updatedAt).toLocaleString()}
                </div>
              </div>
              <span className={statusBadge[ticket.status] ?? "badge-neutral"}>
                {statusLabels[ticket.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
