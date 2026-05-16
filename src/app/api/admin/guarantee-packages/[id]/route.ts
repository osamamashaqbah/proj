import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  feePercent: z.number().int().min(0).max(50).optional(),
  minFeeCents: z.number().int().min(0).optional(),
  features: z.array(z.string().max(200)).max(20).optional(),
  isActive: z.boolean().optional(),
  nameEn: z.string().min(1).max(80).optional(),
  nameAr: z.string().min(1).max(80).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "guarantee.manage");
    const body = Body.parse(await req.json());
    const p = await prisma.guaranteePackage.update({ where: { id: params.id }, data: body });
    return ok({ id: p.id });
  } catch (e) {
    return handleError(e);
  }
}
