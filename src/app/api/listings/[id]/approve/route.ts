import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "listing.approve");
    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return fail("Not found", 404);
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: { status: "APPROVED", approvedById: me!.id, approvedAt: new Date(), rejectionReason: null },
    });
    await prisma.auditLog.create({ data: { actorId: me!.id, action: "listing.approve", target: updated.id } });
    return ok({ id: updated.id });
  } catch (e) {
    return handleError(e);
  }
}
