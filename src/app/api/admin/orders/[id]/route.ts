import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "PAID",
    "IN_ESCROW",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
    "DISPUTED",
  ]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "order.manage");
    const body = Body.parse(await req.json());
    const o = await prisma.order.update({ where: { id: params.id }, data: { status: body.status } });
    return ok({ id: o.id });
  } catch (e) {
    return handleError(e);
  }
}
