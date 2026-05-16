import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, sanitizeText } from "@/lib/api";
import { getCurrentUser, hasPermission, requireUser } from "@/lib/rbac";

const Body = z.object({
  body: z.string().min(1).max(5000),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requireUser(me);

    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
    if (!ticket) return fail("Not found", 404);

    const isStaff = hasPermission(me, "ticket.handle");
    const isAuthor = ticket.authorId === me!.id;
    if (!isStaff && !isAuthor) return fail("Forbidden", 403);
    if (ticket.status === "CLOSED" && !isStaff) return fail("Ticket is closed", 400);

    const { body } = Body.parse(await req.json());
    const text = sanitizeText(body, 5000);

    const message = await prisma.supportTicketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: me!.id,
        body: text,
        isStaff,
      },
    });

    // Update ticket status & assignee on staff reply, and bump updatedAt for user replies
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: isStaff
        ? {
            status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
            assigneeId: ticket.assigneeId ?? me!.id,
            updatedAt: new Date(),
          }
        : { updatedAt: new Date() },
    });

    return ok({ id: message.id });
  } catch (e) {
    return handleError(e);
  }
}
