import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  assigneeId: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "ticket.handle");
    const body = Body.parse(await req.json());
    const t = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: body.status, assigneeId: body.assigneeId ?? me!.id },
    });
    return ok({ id: t.id });
  } catch (e) {
    return handleError(e);
  }
}
