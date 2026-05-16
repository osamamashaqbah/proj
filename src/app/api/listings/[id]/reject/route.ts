import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, sanitizeText } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({ reason: z.string().min(2).max(500) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "listing.reject");
    const { reason } = Body.parse(await req.json());
    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return fail("Not found", 404);
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: { status: "REJECTED", rejectionReason: sanitizeText(reason, 500) },
    });
    await prisma.auditLog.create({ data: { actorId: me!.id, action: "listing.reject", target: updated.id, metadata: { reason } } });
    return ok({ id: updated.id });
  } catch (e) {
    return handleError(e);
  }
}
