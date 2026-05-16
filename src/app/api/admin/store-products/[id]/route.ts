import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  isActive: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
  priceCents: z.number().int().positive().optional(),
  title: z.string().min(2).max(120).optional(),
  description: z.string().min(2).max(5000).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "store.manage");
    const body = Body.parse(await req.json());
    const p = await prisma.officialStoreProduct.update({ where: { id: params.id }, data: body });
    return ok({ id: p.id });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "store.manage");
    await prisma.officialStoreProduct.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
