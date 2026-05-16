import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { getCurrentUser, hasPermission } from "@/lib/rbac";
import { TicketConversation } from "@/components/support/TicketConversation";

export const dynamic = "force-dynamic";

export default async function UserTicketPage({ params }: { params: { id: string } }) {
  const t = getT();
  const me = await getCurrentUser();
  if (!me) redirect(`/login?callbackUrl=/support/${params.id}`);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      assignee: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
    },
  });
  if (!ticket) notFound();

  const isAuthor = ticket.authorId === me.id;
  const isStaff = hasPermission(me, "ticket.handle");
  if (!isAuthor && !isStaff) {
    redirect("/support");
  }

  const t1 = {
    statusLabels: {
      OPEN: t("support.ticketStatus.OPEN"),
      IN_PROGRESS: t("support.ticketStatus.IN_PROGRESS"),
      RESOLVED: t("support.ticketStatus.RESOLVED"),
      CLOSED: t("support.ticketStatus.CLOSED"),
    },
    you: t("support.you"),
    staffReply: t("support.staffReply"),
    writeReply: t("support.writeReply"),
    send: t("support.send"),
    noMessages: t("support.noMessages"),
    closeTicket: t("support.closeTicket"),
    reopenTicket: t("support.reopenTicket"),
    markInProgress: t("support.markInProgress"),
    markResolved: t("support.markResolved"),
    backToList: t("common.back"),
    openedOn: t("support.openedOn"),
    closedNotice: "Ticket is closed. Reopen to send a new reply.",
  };

  return (
    <TicketConversation
      ticket={{
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        authorId: ticket.authorId,
        authorEmail: ticket.author.email,
        authorName: ticket.author.name,
        assigneeEmail: ticket.assignee?.email ?? null,
        createdAt: ticket.createdAt.toISOString(),
        messages: ticket.messages.map((m) => ({
          id: m.id,
          body: m.body,
          isStaff: m.isStaff,
          createdAt: m.createdAt.toISOString(),
          authorId: m.authorId,
          authorName: m.author.name ?? m.author.email,
        })),
      }}
      currentUserId={me.id}
      isStaff={isStaff}
      backHref={isStaff ? "/admin/tickets" : "/support"}
      labels={t1}
    />
  );
}
