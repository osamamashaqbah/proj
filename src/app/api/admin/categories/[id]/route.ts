import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  enabled: z.boolean().optional(),
  riskWarning: z.boolean().optional(),
  nameEn: z.string().min(1).max(80).optional(),
  nameAr: z.string().min(1).max(80).optional(),
  kind: z.enum(["USED_GAMES", "ACCOUNTS", "SUBSCRIPTIONS", "DIGITAL_ITEMS", "SERVICES", "OTHER"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "category.manage");
    const body = Body.parse(await req.json());
    const c = await prisma.category.update({ where: { id: params.id }, data: body });
    return ok({ id: c.id });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "category.manage");
    // Soft-disable instead of hard delete to keep referential integrity
    await prisma.category.update({ where: { id: params.id }, data: { enabled: false } });
    return ok({ disabled: true });
  } catch (e) {
    return handleError(e);
  }
}
