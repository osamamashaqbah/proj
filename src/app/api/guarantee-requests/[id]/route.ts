import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  status: z.enum([
    "REQUESTED",
    "AWAITING_FUNDS",
    "HELD_IN_ESCROW",
    "RELEASED",
    "REFUNDED",
    "REJECTED",
    "DISPUTED",
  ]),
});

const STATUS_TO_ORDER: Record<string, string | null> = {
  HELD_IN_ESCROW: "IN_ESCROW",
  RELEASED: "COMPLETED",
  REFUNDED: "REFUNDED",
  REJECTED: "CANCELLED",
  DISPUTED: "DISPUTED",
  AWAITING_FUNDS: "PENDING_PAYMENT",
  REQUESTED: null,
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "guarantee.handle");
    const body = Body.parse(await req.json());
    const updated = await prisma.guaranteeRequest.update({
      where: { id: params.id },
      data: { status: body.status as any, handledById: me!.id },
    });
    const orderStatus = STATUS_TO_ORDER[body.status];
    if (orderStatus) {
      await prisma.order.update({
        where: { id: updated.orderId },
        data: { status: orderStatus as any },
      });
    }
    await prisma.auditLog.create({
      data: { actorId: me!.id, action: `guarantee.${body.status}`, target: updated.id },
    });
    return ok({ id: updated.id });
  } catch (e) {
    return handleError(e);
  }
}
