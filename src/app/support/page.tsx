import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/rbac";
import { NewTicketForm } from "./NewTicketForm";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const t = getT();
  const me = await getCurrentUser();
  if (!me) redirect("/login?callbackUrl=/support");

  const tickets = await prisma.supportTicket.findMany({
    where: { authorId: me.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
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
    <div className="grid md:grid-cols-[1.2fr_1fr] gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="section-title">{t("support.myTickets")}</h1>
        </div>
        {tickets.length === 0 && <div className="muted">{t("support.noTickets")}</div>}
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="card card-hover block"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="font-semibold text-silver-bright truncate">
                    {ticket.subject}
                  </div>
                  <div className="muted text-xs mt-1 line-clamp-2">{ticket.body}</div>
                  <div className="muted text-xs mt-2">
                    {t("support.openedOn")}: {new Date(ticket.createdAt).toLocaleDateString()}
                    {" · "}
                    💬 {ticket._count.messages}
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

      <div className="space-y-4">
        <div>
          <h2 className="section-title">{t("support.newTicket")}</h2>
          <p className="muted text-sm mt-1">{t("support.subtitle")}</p>
        </div>
        <NewTicketForm
          labels={{
            subject: t("support.subject"),
            message: t("support.message"),
            submit: t("support.submit"),
            submitted: t("support.submitted"),
            generic: t("auth.errors.generic"),
          }}
        />
      </div>
    </div>
  );
}
