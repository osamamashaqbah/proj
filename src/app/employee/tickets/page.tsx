import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { TicketRow } from "./TicketRow";

export const dynamic = "force-dynamic";

export default async function EmployeeTicketsPage() {
  const t = getT();
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, assignee: true },
  });
  return (
    <div className="space-y-6">
      <h1 className="section-title">{t("dashboard.employee.tickets")}</h1>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Author</th>
              <th>Status</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <TicketRow key={t.id} ticket={{
                id: t.id,
                subject: t.subject,
                body: t.body,
                status: t.status,
                authorEmail: t.author.email,
              }} />
            ))}
            {tickets.length === 0 && <tr><td colSpan={4} className="muted">—</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
