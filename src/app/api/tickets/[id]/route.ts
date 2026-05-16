import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, hasPermission, requireUser } from "@/lib/rbac";

const Body = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  assigneeId: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requireUser(me);
    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
    if (!ticket) return fail("Not found", 404);

    const body = Body.parse(await req.json());
    const isStaff = hasPermission(me, "ticket.handle");
    const isAuthor = ticket.authorId === me!.id;

    // Authors can only close/reopen their own ticket. Staff can do anything.
    if (!isStaff) {
      if (!isAuthor) return fail("Forbidden", 403);
      // restrict author transitions
      const allowed = ["CLOSED", "OPEN"] as const;
      if (body.status && !allowed.includes(body.status as any)) {
        return fail("Forbidden", 403);
      }
      if (body.assigneeId) return fail("Forbidden", 403);
    }

    const t = await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        status: body.status,
        assigneeId: isStaff ? body.assigneeId ?? me!.id : undefined,
      },
    });
    return ok({ id: t.id });
  } catch (e) {
    return handleError(e);
  }
}
